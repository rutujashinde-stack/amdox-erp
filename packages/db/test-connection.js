const { Pool } = require('pg')

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'amdox',
  password: 'amdox123',
  database: 'amdox_erp',
})

pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('CONNECTION FAILED:', err.message)
  } else {
    console.log('CONNECTION SUCCESS:', res.rows)
  }
  pool.end()
})