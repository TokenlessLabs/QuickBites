const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes'); 
const userPreferenceRoutes = require('./routes/userPreferenceRoutes'); 
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cuisineRoutes = require('./routes/cuisineRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));

app.use('/api', userRoutes);
app.use('/api', userPreferenceRoutes);
app.use('/api', restaurantRoutes);
app.use('/api', tableRoutes);
app.use('/api', reservationRoutes);
app.use('/api', reviewRoutes);
app.use('/api', cuisineRoutes);
app.use('/api', paymentRoutes);

app.use((error, _req, res, _next) => {
  const isUploadError = error.name === 'MulterError' || error.message === 'Only image files are allowed.';
  res.status(isUploadError ? 400 : 500).json({
    success: false,
    message: isUploadError ? error.message : 'Unexpected server error.',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
