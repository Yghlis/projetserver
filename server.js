const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Configurer PostgreSQL
const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mycrudapp',
  password: 'mypassword',
  port: 5432,
});

// Créer la table si elle n'existe pas
pool.query(`
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  description TEXT
)
`, (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Table 'items' is ready");
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/items', async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query('INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/items/:id', async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query('UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *', [name, description, req.params.id]);
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.send({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
