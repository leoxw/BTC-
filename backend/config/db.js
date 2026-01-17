import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '66.103.198.158',
  port: 19306,
  user: 'btcusr',
  password: 'pBrFY8sDRiepQZMR',
  database: 'btc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;