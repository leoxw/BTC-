import pool from '../config/db.js';

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    
    const connection = await pool.getConnection();
    console.log('✓ Connected to MySQL database successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('✓ MySQL version:', rows[0].version);
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✓ Tables in database:', tables.map(t => Object.values(t)[0]));
    
    connection.release();
    console.log('✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();