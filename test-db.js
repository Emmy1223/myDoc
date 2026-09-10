require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

sql`SELECT 1 as ok`
  .then((r) => console.log('✅ Connection OK:', r))
  .catch((e) => console.error('❌ Failed:', e.message));
