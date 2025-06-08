const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = './data.json';

app.use(express.json());
app.use(express.static('public'));

// Get stats
app.get('/api/stats', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  res.json(data);
});

app.post('/api/update', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const delta = req.body.delta;
  data[today] = (data[today] || 0) + delta;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  res.json({ count: data[today] });
});



