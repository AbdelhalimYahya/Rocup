const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

/* 
  --- DEPLOYMENT INSTRUCTIONS ---
  When deploying this backend to Vercel (using Vercel Postgres), they will provide a single 
  `POSTGRES_URL` environment variable. You should comment out the block above and 
  uncomment the block below to use the production URL and required SSL settings:
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
*/

module.exports = pool;
