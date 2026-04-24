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
      [team_name, num_members, department, leader_name, leader_phone, leader_national_id, leader_email, members || null, receipt_url]
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

// 4. Export Data to Excel (Admin)
app.get('/api/applications/export', async (req, res) => {
  try {
    const allApps = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');

    const excelData = allApps.rows.map(app => {
      const baseData = {
        'ID': app.id,
        'Team Name': app.team_name,
        'Members Count': app.num_members,
        'Department': app.department,
        'Status': app.status,
        'Leader Name': app.leader_name,
        'Leader Phone': app.leader_phone,
        'Leader National ID': app.leader_national_id,
        'Leader Email': app.leader_email,
        'Submission Date': new Date(app.created_at).toLocaleString()
      };

      // Ensure consistent columns by initializing slots for up to 4 additional members (since max team size is 5)
      for (let i = 0; i < 4; i++) {
        const mId = i + 1;
        baseData[`Member ${mId} Name`] = '';
        baseData[`Member ${mId} Phone`] = '';
        baseData[`Member ${mId} National ID`] = '';
        baseData[`Member ${mId} Email`] = '';
      }

      if (app.members) {
         try {
           const membersArr = typeof app.members === 'string' ? JSON.parse(app.members) : app.members;
           if (Array.isArray(membersArr)) {
             membersArr.forEach((m, idx) => {
               if (idx < 4) { // Up to 4 additional members
                 const mId = idx + 1;
                 baseData[`Member ${mId} Name`] = m.name || '';
                 baseData[`Member ${mId} Phone`] = m.phone || '';
                 baseData[`Member ${mId} National ID`] = m.national_id || '';
                 baseData[`Member ${mId} Email`] = m.email || '';
               }
             });
           }
         } catch(e) {}
      }

      return baseData;
    });

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Applications');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="applications.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during export' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
