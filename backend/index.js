const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes

// 1. Submit Application
app.post('/api/applications', upload.single('receipt'), async (req, res) => {
  try {
    const {
      team_name, num_members, department,
      leader_name, leader_phone, leader_national_id, leader_email,
      members // Expected as JSON string
    } = req.body;

    const receipt_url = req.file ? `/uploads/${req.file.filename}` : null;

    const newApp = await pool.query(
      `INSERT INTO applications (team_name, num_members, department, leader_name, leader_phone, leader_national_id, leader_email, members, receipt_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [team_name, num_members, department, leader_name, leader_phone, leader_national_id, leader_email, members ? JSON.parse(members) : null, receipt_url]
    );

    res.status(201).json(newApp.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Get All Applications (Admin)
app.get('/api/applications', async (req, res) => {
  try {
    const allApps = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
    res.json(allApps.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Update Application Status (Approve/Reject)
app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedApp = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updatedApp.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(updatedApp.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Import Data from Excel (Admin)
app.post('/api/applications/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (let row of data) {
      // Basic mapping - assuming columns match exact names
      // In production, validation and more robust mapping is needed
      await pool.query(
        `INSERT INTO applications (team_name, num_members, department, leader_name, leader_phone, leader_national_id, leader_email, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          row.team_name,
          row.num_members || 1,
          row.department,
          row.leader_name,
          row.leader_phone,
          row.leader_national_id,
          row.leader_email,
          row.status || 'pending'
        ]
      );
    }

    // Delete the file after processing
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Data imported successfully', count: data.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during import' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
