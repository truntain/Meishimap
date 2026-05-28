const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'postgres',
});

async function run() {
  try {
    await client.connect();
    console.log('CONNECTED_TO_POSTGRES_SUCCESS');
    
    const dbs = await client.query("SELECT datname FROM pg_database WHERE datname = 'ITSS Nhat'");
    console.log('Databases matching "ITSS Nhat":', dbs.rows);
    
    if (dbs.rows.length === 0) {
      console.log('DB_ITSS_NHAT_DOES_NOT_EXIST');
    } else {
      console.log('Connecting to "ITSS Nhat"...');
      const appClient = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '123456',
        database: 'ITSS Nhat',
      });
      await appClient.connect();
      console.log('Connected to "ITSS Nhat" successfully!');
      
      const tables = await appClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
      console.log('Tables in public schema:', tables.rows.map(r => r.table_name));
      
      for (const table of tables.rows) {
        const count = await appClient.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
        console.log(`Table "${table.table_name}" has ${count.rows[0].count} rows.`);
      }
      
      await appClient.end();
    }
  } catch (err) {
    console.error('DATABASE_TEST_ERROR:', err.message);
  } finally {
    await client.end();
  }
}

run();
