require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ BENAR — naik satu level ke backend/uploads/
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cabang', require('./routes/cabang'));
app.use('/api/perusahaan', require('./routes/perusahaan'));
app.use('/api/kandidat', require('./routes/kandidat'));
app.use('/api/users', require('./routes/users'));
app.use('/api/joborder', require('./routes/joborder'));
app.use('/api/pendaftaran', require('./routes/pendaftaran'));
app.use('/api/history', require('./routes/history'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});
