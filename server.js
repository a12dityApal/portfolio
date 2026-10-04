require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const Project = mongoose.model('Project', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [String],
  repo: String,
  live: String,
  order: { type: Number, default: 0 },
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 150 },
  message: { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
}));

const seedProjects = [
  {
    title: 'Job Description Analyzer Agent',
    description: 'Paste a job description and get the key skills, gaps against your resume, and what to learn next. Built with the Claude API and a Streamlit interface.',
    tags: ['Python', 'Claude API', 'Streamlit'],
    repo: '', live: '', order: 1,
  },
  {
    title: 'Personal Portfolio Website',
    description: 'This site. A full-stack portfolio where projects load from a MongoDB database and visitors can send messages that are stored for me to read.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
    repo: '', live: '', order: 2,
  },
];

let dbReady = false;

app.get('/api/projects', async (req, res) => {
  try {
    if (!dbReady) return res.json(seedProjects);
    res.json(await Project.find().sort({ order: 1 }).lean());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load projects.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  const emailOk = typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email);
  if (!name?.trim() || !emailOk || !message?.trim()) {
    return res.status(400).json({ error: 'Enter your name, a valid email, and a message.' });
  }
  if (!dbReady) {
    return res.status(503).json({ error: 'Messages are not being saved right now. Email me directly instead.' });
  }
  try {
    await Message.create({ name: name.trim(), email: email.trim(), message: message.trim() });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send your message. Try again.' });
  }
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      dbReady = true;
      if ((await Project.countDocuments()) === 0) await Project.insertMany(seedProjects);
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection failed:', err.message);
    }
  }
  app.listen(PORT, () => console.log('Running on port ' + PORT));
}
start();
