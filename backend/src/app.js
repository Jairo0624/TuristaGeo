const express = require('express');
const cors = require('cors');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.status(200).json({ ok: true, message: 'TuristaGeo API funcionando' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/zones', require('./routes/zoneRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
