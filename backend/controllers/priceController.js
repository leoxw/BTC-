import pool from '../config/db.js';

export const getPriceData = async (req, res) => {
  try {
    const { days } = req.query;

    let query = 'SELECT * FROM price_data ORDER BY start_date ASC';
    let params = [];

    if (days && days !== 'max') {
      const daysNum = parseInt(days);
      if (!isNaN(daysNum)) {
        query = 'SELECT * FROM price_data WHERE start_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY start_date ASC';
        params = [daysNum];
      }
    }

    const [rows] = await pool.execute(query, params);

    res.json({
      data: rows.map(row => ({
        timestamp: new Date(row.start_date).getTime(),
        dateString: row.start_date.toISOString().split('T')[0],
        open: parseFloat(row.open),
        high: parseFloat(row.high),
        low: parseFloat(row.low),
        close: parseFloat(row.close),
        volume: parseFloat(row.volume),
        marketCap: parseFloat(row.market_cap),
        formattedTime: row.start_date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      }))
    });
  } catch (error) {
    console.error('Get price data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadPriceData = async (req, res) => {
  try {
    const { token, csvData } = req.body;

    if (!token || !csvData) {
      return res.status(400).json({ error: 'Token and csvData are required' });
    }

    // Verify admin session
    const [sessionRows] = await pool.execute(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > NOW()',
      [token]
    );

    if (sessionRows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return res.status(400).json({ error: 'Invalid CSV data' });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const entry = {};

      headers.forEach((h, idx) => {
        entry[h] = values[idx];
      });

      const startDate = entry.Start || entry.Date;
      const endDate = entry.End || entry.Date;

      if (!startDate || !endDate) continue;

      data.push({
        start_date: startDate,
        end_date: endDate,
        open: parseFloat(entry.Open || entry.open || 0),
        high: parseFloat(entry.High || entry.high || 0),
        low: parseFloat(entry.Low || entry.low || 0),
        close: parseFloat(entry.Close || entry.Price || entry.close || 0),
        volume: parseFloat(entry.Volume || entry.volume || 0),
        market_cap: parseFloat(entry['Market Cap'] || entry.MarketCap || 0)
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete all existing price data
      await connection.execute('TRUNCATE TABLE price_data');

      // Insert new data in batches
      for (const record of data) {
        await connection.execute(
          `INSERT INTO price_data (start_date, end_date, open, high, low, close, volume, market_cap) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           end_date = VALUES(end_date), open = VALUES(open), high = VALUES(high), low = VALUES(low), 
           close = VALUES(close), volume = VALUES(volume), market_cap = VALUES(market_cap)`,
          [record.start_date, record.end_date, record.open, record.high, record.low, 
           record.close, record.volume, record.market_cap]
        );
      }

      await connection.commit();
      res.json({ success: true, count: data.length });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Upload price data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};