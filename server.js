require('dotenv').config();
const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  tls: true,
  serverSelectionTimeoutMS: 5000,
});
let db, collection;

app.use(express.json());
app.use(express.static("public"));

async function connectDB() {
  await client.connect();
  db = client.db("counterApp");
  collection = db.collection("stats");
}

app.get("/api/stats", async (req, res) => {
  const stats = await collection.find({}).toArray();
  const result = {};
  stats.forEach(({ date, count }) => {
    result[date] = count;
  });
  res.json(result);
});

app.post("/api/update", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const delta = req.body.delta;

  const doc = await collection.findOne({ date: today });
  const newCount = (doc?.count || 0) + delta;

  await collection.updateOne(
    { date: today },
    { $set: { count: newCount } },
    { upsert: true }
  );

  res.json({ count: newCount });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
