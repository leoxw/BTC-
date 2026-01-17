import pool from '../config/db.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [rows] = await pool.execute(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate session token
    const sessionToken = `session_${user.id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.execute(
      'INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionToken, user.id, expiresAt]
    );

    res.json({ 
      success: true, 
      token: sessionToken, 
      user: { id: user.id, username: user.username } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifySession = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    const [rows] = await pool.execute(
      `SELECT s.*, u.username 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.session_id = ? AND s.expires_at > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({ 
      valid: true, 
      user: { id: rows[0].user_id, username: rows[0].username } 
    });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (token) {
      await pool.execute(
        'DELETE FROM sessions WHERE session_id = ?',
        [token]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token first
    const [sessionRows] = await pool.execute(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > NOW()',
      [token]
    );

    if (sessionRows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = sessionRows[0].user_id;

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};