import pool from '../config/db.js';

export const getNewsEvents = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    const [rows] = await pool.execute(
      'SELECT * FROM news_events WHERE lang = ? ORDER BY date ASC',
      [lang]
    );

    res.json({
      events: rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        title: row.title,
        description: row.description,
        type: row.type
      }))
    });
  } catch (error) {
    console.error('Get news events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNewsEvents = async (req, res) => {
  try {
    const { token, lang, events } = req.body;

    if (!token || !lang || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Token, lang, and events array are required' });
    }

    // Verify admin session
    const [sessionRows] = await pool.execute(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > NOW()',
      [token]
    );

    if (sessionRows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete existing events for this language
      await connection.execute(
        'DELETE FROM news_events WHERE lang = ?',
        [lang]
      );

      // Insert new events
      for (const event of events) {
        await connection.execute(
          'INSERT INTO news_events (date, title, description, type, lang) VALUES (?, ?, ?, ?, ?)',
          [event.date, event.title, event.description, event.type, lang]
        );
      }

      await connection.commit();
      res.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update news events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};