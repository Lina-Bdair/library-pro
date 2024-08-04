const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'library_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database.');
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Register endpoint
app.post('/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });

    const sql = 'INSERT INTO users (first_name, last_name, email, password, verification_token) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [firstName, lastName, email, hashedPassword, token], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Send confirmation email
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Please confirm your email',
            html: `<p>Click <a href="http://localhost:5000/verify/${token}">here</a> to verify your email.</p>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Registration successful. Please check your email for verification link.' });
        });
    });
});

// Email verification endpoint
app.get('/verify/:token', (req, res) => {
    const { token } = req.params;

    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) return res.status(400).json({ error: 'Invalid or expired token.' });

        const sql = 'UPDATE users SET email_verified = 1, verification_token = NULL WHERE email = ?';
        db.query(sql, [decoded.email], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).send('Email verified successfully!');
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password.' });

        const user = results[0];
        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

// Server listening
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
