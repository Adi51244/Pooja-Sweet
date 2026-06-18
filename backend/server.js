import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { authMiddleware, signToken, getSettings } from './auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function currentMonth() {
  return todayDate().slice(0, 7);
}

function monthFromDate(dateStr) {
  return dateStr.slice(0, 7);
}

// --- Public ---

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', date: todayDate() });
});

app.post('/api/auth/login', (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN is required' });

  const admin = db.prepare('SELECT * FROM admin_settings WHERE id = 1').get();
  if (!bcrypt.compareSync(String(pin), admin.pin_hash)) {
    return res.status(401).json({ error: 'Wrong PIN. Try again.' });
  }

  const token = signToken();
  const settings = getSettings();
  res.json({ token, shop_name: settings.shop_name });
});

// --- Protected routes ---

app.use('/api', authMiddleware);

app.get('/api/auth/me', (_req, res) => {
  const settings = getSettings();
  res.json(settings);
});

app.put('/api/auth/settings', (req, res) => {
  const { admin_phone, shop_name } = req.body;
  const current = db.prepare('SELECT * FROM admin_settings WHERE id = 1').get();

  db.prepare(
    `UPDATE admin_settings SET admin_phone = ?, shop_name = ?, updated_at = datetime('now') WHERE id = 1`
  ).run(
    admin_phone?.trim() ?? current.admin_phone,
    shop_name?.trim() ?? current.shop_name
  );

  res.json(getSettings());
});

app.put('/api/auth/change-pin', (req, res) => {
  const { old_pin, new_pin } = req.body;
  if (!old_pin || !new_pin) {
    return res.status(400).json({ error: 'Old and new PIN are required' });
  }
  if (String(new_pin).length < 4) {
    return res.status(400).json({ error: 'PIN must be at least 4 digits' });
  }

  const admin = db.prepare('SELECT * FROM admin_settings WHERE id = 1').get();
  if (!bcrypt.compareSync(String(old_pin), admin.pin_hash)) {
    return res.status(401).json({ error: 'Current PIN is wrong' });
  }

  const pinHash = bcrypt.hashSync(String(new_pin), 10);
  db.prepare(
    `UPDATE admin_settings SET pin_hash = ?, updated_at = datetime('now') WHERE id = 1`
  ).run(pinHash);

  res.json({ success: true });
});

// --- Staff ---

app.get('/api/staff', (req, res) => {
  const activeOnly = req.query.active !== 'false';
  const staff = activeOnly
    ? db.prepare('SELECT * FROM staff WHERE active = 1 ORDER BY name').all()
    : db.prepare('SELECT * FROM staff ORDER BY name').all();
  res.json(staff);
});

app.post('/api/staff', (req, res) => {
  const { name, role = '', phone = '', snack_amount = 0, monthly_salary = 0 } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const result = db
    .prepare(
      'INSERT INTO staff (name, role, phone, snack_amount, monthly_salary) VALUES (?, ?, ?, ?, ?)'
    )
    .run(
      name.trim(),
      role.trim(),
      phone.trim(),
      Number(snack_amount) || 0,
      Number(monthly_salary) || 0
    );
  const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(staff);
});

app.put('/api/staff/:id', (req, res) => {
  const { name, role, phone, snack_amount, monthly_salary, active } = req.body;
  const existing = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Staff not found' });

  db.prepare(
    `UPDATE staff SET name = ?, role = ?, phone = ?, snack_amount = ?, monthly_salary = ?, active = ?
     WHERE id = ?`
  ).run(
    name?.trim() ?? existing.name,
    role?.trim() ?? existing.role,
    phone?.trim() ?? existing.phone,
    snack_amount ?? existing.snack_amount,
    monthly_salary ?? existing.monthly_salary,
    active ?? existing.active,
    req.params.id
  );
  const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
  res.json(staff);
});

app.delete('/api/staff/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Staff not found' });
  db.prepare('UPDATE staff SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Snack Payments (separate from salary) ---

app.get('/api/payments/today', (req, res) => {
  const date = req.query.date || todayDate();
  const staff = db.prepare('SELECT * FROM staff WHERE active = 1 ORDER BY name').all();

  const getPayment = db.prepare(
    'SELECT * FROM payments WHERE staff_id = ? AND date = ?'
  );

  const result = staff.map((s) => {
    const payment = getPayment.get(s.id, date);
    return {
      staff: s,
      payment: payment || null,
      paid: payment?.paid === 1,
      amount: payment?.amount ?? s.snack_amount,
    };
  });

  const summary = {
    date,
    total: result.length,
    paid: result.filter((r) => r.paid).length,
    pending: result.filter((r) => !r.paid).length,
    totalAmount: result.filter((r) => r.paid).reduce((sum, r) => sum + r.amount, 0),
  };

  res.json({ summary, records: result });
});

app.post('/api/payments/toggle', (req, res) => {
  const { staff_id, date = todayDate(), note = '' } = req.body;
  if (!staff_id) return res.status(400).json({ error: 'staff_id is required' });

  const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staff_id);
  if (!staff) return res.status(404).json({ error: 'Staff not found' });

  const existing = db
    .prepare('SELECT * FROM payments WHERE staff_id = ? AND date = ?')
    .get(staff_id, date);

  if (existing) {
    const newPaid = existing.paid === 1 ? 0 : 1;
    db.prepare('UPDATE payments SET paid = ?, note = ? WHERE id = ?').run(
      newPaid,
      note || existing.note,
      existing.id
    );
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(existing.id);
    return res.json({ payment, paid: newPaid === 1 });
  }

  const result = db
    .prepare(
      'INSERT INTO payments (staff_id, date, amount, paid, note) VALUES (?, ?, ?, 1, ?)'
    )
    .run(staff_id, date, staff.snack_amount, note);

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ payment, paid: true });
});

app.post('/api/payments/mark-all', (req, res) => {
  const { date = todayDate(), paid = true } = req.body;
  const staff = db.prepare('SELECT * FROM staff WHERE active = 1').all();

  const upsert = db.prepare(`
    INSERT INTO payments (staff_id, date, amount, paid)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(staff_id, date) DO UPDATE SET paid = excluded.paid
  `);

  const transaction = db.transaction((members) => {
    for (const s of members) {
      upsert.run(s.id, date, s.snack_amount, paid ? 1 : 0);
    }
  });

  transaction(staff);
  res.json({ success: true, count: staff.length });
});

app.get('/api/payments/history', (req, res) => {
  const { from, to, staff_id } = req.query;
  let query = `
    SELECT p.*, s.name as staff_name, s.role as staff_role
    FROM payments p
    JOIN staff s ON s.id = p.staff_id
    WHERE p.paid = 1
  `;
  const params = [];

  if (from) {
    query += ' AND p.date >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND p.date <= ?';
    params.push(to);
  }
  if (staff_id) {
    query += ' AND p.staff_id = ?';
    params.push(staff_id);
  }

  query += ' ORDER BY p.date DESC, s.name ASC LIMIT 200';
  const history = db.prepare(query).all(...params);
  res.json(history);
});

app.get('/api/payments/dates', (req, res) => {
  const dates = db
    .prepare(
      `SELECT date,
              COUNT(*) as total,
              SUM(CASE WHEN paid = 1 THEN 1 ELSE 0 END) as paid_count,
              SUM(CASE WHEN paid = 1 THEN amount ELSE 0 END) as total_amount
       FROM payments
       GROUP BY date
       ORDER BY date DESC
       LIMIT 30`
    )
    .all();
  res.json(dates);
});

// --- WhatsApp Reminder ---

app.get('/api/reminders/whatsapp', (req, res) => {
  const date = req.query.date || todayDate();
  const staff_id = req.query.staff_id; // optional — for single staff
  const settings = getSettings();
  const shopName = settings.shop_name || 'Pooja Sweets';

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Single staff reminder
  if (staff_id) {
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staff_id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });

    const payment = db.prepare('SELECT * FROM payments WHERE staff_id = ? AND date = ?').get(staff_id, date);
    const paid = payment?.paid === 1;

    const message = paid
      ? `✅ ${shopName}\n\nHello ${staff.name}!\nYour snack money ₹${staff.snack_amount} has been given for ${formattedDate}. 🙏`
      : `🍬 ${shopName}\n\nHello ${staff.name}!\nYour snack money ₹${staff.snack_amount} is pending for ${formattedDate}.\n\nPlease collect it from the shop.`;

    const phone = staff.phone?.replace(/\D/g, '');
    const waPhone = phone ? (phone.startsWith('91') ? phone : `91${phone}`) : '';
    const url = waPhone
      ? `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    return res.json({ url, message, staff_name: staff.name, has_phone: !!waPhone });
  }

  // All staff — return list with individual WhatsApp links
  const staff = db.prepare('SELECT * FROM staff WHERE active = 1 ORDER BY name').all();
  const getPayment = db.prepare('SELECT * FROM payments WHERE staff_id = ? AND date = ?');

  const results = staff.map((s) => {
    const payment = getPayment.get(s.id, date);
    const paid = payment?.paid === 1;

    const message = paid
      ? `✅ ${shopName}\n\nHello ${s.name}!\nYour snack money ₹${s.snack_amount} has been given for ${formattedDate}. 🙏`
      : `🍬 ${shopName}\n\nHello ${s.name}!\nYour snack money ₹${s.snack_amount} is pending for ${formattedDate}.\n\nPlease collect it from the shop.`;

    const phone = s.phone?.replace(/\D/g, '');
    const waPhone = phone ? (phone.startsWith('91') ? phone : `91${phone}`) : '';
    const url = waPhone
      ? `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`
      : null;

    return {
      staff_id: s.id,
      staff_name: s.name,
      phone: s.phone,
      has_phone: !!waPhone,
      paid,
      amount: s.snack_amount,
      url,
      message,
    };
  });

  res.json({ date, records: results });
});

// --- Advances (deducted from salary only, NOT snacks) ---

app.get('/api/advances', (req, res) => {
  const month = req.query.month || currentMonth();
  const staff_id = req.query.staff_id;

  let query = `
    SELECT a.*, s.name as staff_name
    FROM advances a
    JOIN staff s ON s.id = a.staff_id
    WHERE a.month = ?
  `;
  const params = [month];

  if (staff_id) {
    query += ' AND a.staff_id = ?';
    params.push(staff_id);
  }

  query += ' ORDER BY a.date DESC';
  res.json(db.prepare(query).all(...params));
});

app.post('/api/advances', (req, res) => {
  const { staff_id, amount, date = todayDate(), note = '' } = req.body;
  if (!staff_id || !amount) {
    return res.status(400).json({ error: 'Staff and amount are required' });
  }

  const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staff_id);
  if (!staff) return res.status(404).json({ error: 'Staff not found' });

  const month = monthFromDate(date);
  const result = db
    .prepare(
      'INSERT INTO advances (staff_id, amount, date, month, note) VALUES (?, ?, ?, ?, ?)'
    )
    .run(staff_id, Number(amount), date, month, note.trim());

  syncSalaryRecord(staff_id, month);

  const advance = db
    .prepare(
      `SELECT a.*, s.name as staff_name FROM advances a
       JOIN staff s ON s.id = a.staff_id WHERE a.id = ?`
    )
    .get(result.lastInsertRowid);
  res.status(201).json(advance);
});

app.delete('/api/advances/:id', (req, res) => {
  const advance = db.prepare('SELECT * FROM advances WHERE id = ?').get(req.params.id);
  if (!advance) return res.status(404).json({ error: 'Advance not found' });

  db.prepare('DELETE FROM advances WHERE id = ?').run(req.params.id);
  syncSalaryRecord(advance.staff_id, advance.month);
  res.json({ success: true });
});

function getAdvancesTotal(staffId, month) {
  const row = db
    .prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM advances WHERE staff_id = ? AND month = ?'
    )
    .get(staffId, month);
  return row.total;
}

function syncSalaryRecord(staffId, month) {
  const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId);
  if (!staff) return;

  const advancesTotal = getAdvancesTotal(staffId, month);
  const salaryAmount = staff.monthly_salary;
  const netAmount = Math.max(0, salaryAmount - advancesTotal);

  const existing = db
    .prepare('SELECT * FROM salary_records WHERE staff_id = ? AND month = ?')
    .get(staffId, month);

  if (existing) {
    db.prepare(
      `UPDATE salary_records SET salary_amount = ?, advances_total = ?, net_amount = ?
       WHERE staff_id = ? AND month = ?`
    ).run(salaryAmount, advancesTotal, netAmount, staffId, month);
  } else if (advancesTotal > 0 || salaryAmount > 0) {
    db.prepare(
      `INSERT INTO salary_records (staff_id, month, salary_amount, advances_total, net_amount)
       VALUES (?, ?, ?, ?, ?)`
    ).run(staffId, month, salaryAmount, advancesTotal, netAmount);
  }
}

// --- Salary ---

app.get('/api/salary', (req, res) => {
  const month = req.query.month || currentMonth();
  const staff = db.prepare('SELECT * FROM staff WHERE active = 1 ORDER BY name').all();

  const getRecord = db.prepare(
    'SELECT * FROM salary_records WHERE staff_id = ? AND month = ?'
  );
  const getAdvances = db.prepare(
    'SELECT * FROM advances WHERE staff_id = ? AND month = ? ORDER BY date DESC'
  );

  const records = staff.map((s) => {
    let record = getRecord.get(s.id, month);
    const advances = getAdvances.all(s.id, month);
    const advancesTotal = advances.reduce((sum, a) => sum + a.amount, 0);
    const salaryAmount = s.monthly_salary;
    const netAmount = Math.max(0, salaryAmount - advancesTotal);

    if (!record && (advancesTotal > 0 || salaryAmount > 0)) {
      syncSalaryRecord(s.id, month);
      record = getRecord.get(s.id, month);
    }

    return {
      staff: s,
      month,
      salary_amount: salaryAmount,
      advances_total: advancesTotal,
      net_amount: netAmount,
      advances,
      paid: record?.paid === 1,
      paid_date: record?.paid_date || null,
      record_id: record?.id || null,
    };
  });

  const summary = {
    month,
    total_staff: records.length,
    total_salary: records.reduce((s, r) => s + r.salary_amount, 0),
    total_advances: records.reduce((s, r) => s + r.advances_total, 0),
    total_net: records.reduce((s, r) => s + r.net_amount, 0),
    paid_count: records.filter((r) => r.paid).length,
    pending_count: records.filter((r) => !r.paid && r.salary_amount > 0).length,
  };

  res.json({ summary, records });
});

app.post('/api/salary/mark-paid', (req, res) => {
  const { staff_id, month = currentMonth(), note = '' } = req.body;
  if (!staff_id) return res.status(400).json({ error: 'staff_id is required' });

  const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staff_id);
  if (!staff) return res.status(404).json({ error: 'Staff not found' });

  syncSalaryRecord(staff_id, month);
  const record = db
    .prepare('SELECT * FROM salary_records WHERE staff_id = ? AND month = ?')
    .get(staff_id, month);

  if (record) {
    db.prepare(
      `UPDATE salary_records SET paid = 1, paid_date = ?, note = ? WHERE id = ?`
    ).run(todayDate(), note, record.id);
  } else {
    const advancesTotal = getAdvancesTotal(staff_id, month);
    const netAmount = Math.max(0, staff.monthly_salary - advancesTotal);
    db.prepare(
      `INSERT INTO salary_records (staff_id, month, salary_amount, advances_total, net_amount, paid, paid_date, note)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(
      staff_id,
      month,
      staff.monthly_salary,
      advancesTotal,
      netAmount,
      todayDate(),
      note
    );
  }

  const updated = db
    .prepare('SELECT * FROM salary_records WHERE staff_id = ? AND month = ?')
    .get(staff_id, month);
  res.json(updated);
});

app.post('/api/salary/unmark', (req, res) => {
  const { staff_id, month = currentMonth() } = req.body;
  if (!staff_id) return res.status(400).json({ error: 'staff_id is required' });

  const record = db
    .prepare('SELECT * FROM salary_records WHERE staff_id = ? AND month = ?')
    .get(staff_id, month);

  if (record) {
    db.prepare(
      `UPDATE salary_records SET paid = 0, paid_date = NULL WHERE id = ?`
    ).run(record.id);
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Pooja Sweets API running on http://localhost:${PORT}`);
});
