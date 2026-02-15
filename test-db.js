const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/smart_airport_ride_pooling?schema=public',
});
client.connect()
  .then(() => { console.log('Connected successfully!'); client.end(); })
  .catch(err => { console.error('Connection error:', err); client.end(); });
