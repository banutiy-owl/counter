require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schema and model
const statsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  count: { type: Number, required: true }
});
const Stats = mongoose.model('stats', statsSchema);

app.use(express.json());
app.use(express.static('public'));

// Simulate "createTable" for MongoDB (not required, but keeping structure)
async function createTable() {
  // No-op for MongoDB; collection is created automatically
}

app.get('/api/stats', async (req, res) => {
  try {
    const result = await Stats.find().sort({ date: 1 });
    const data = {};
    result.forEach(({ date, count }) => {
      data[date] = count;
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/update', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const delta = Number(req.body.delta);

    // Try to get existing count for today
    const existing = await Stats.findOne({ date: today });

    let newCount = delta;
    if (existing) {
      newCount += existing.count;
      await Stats.updateOne({ date: today }, { count: newCount });
    } else {
      await Stats.create({ date: today, count: newCount });
    }

    res.json({ count: newCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

async function startServer() {
  try {
    await createTable(); // Does nothing for MongoDB, but kept for structure
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
