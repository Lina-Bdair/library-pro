// Middleware to authenticate users
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Profile endpoint
app.get('/profile', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found.' });
        res.status(200).json(results[0]);
    });
});

// Request confirmation email
app.post('/request-confirmation', authenticateToken, (req, res) => {
    const sql = 'SELECT email, verification_token FROM users WHERE id = ?';
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found.' });

        const user = results[0];
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: user.email,
            subject: 'Please confirm your email',
            html: `<p>Click <a href="http://localhost:3000/verify/${user.verification_token}">here</a> to verify your email.</p>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Confirmation email sent.' });
        });
    });
});
