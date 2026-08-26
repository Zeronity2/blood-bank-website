const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Enquiry = require('./models/Enquiry');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Test GET API
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Express API is working!'
  });
});


// Test POST API
app.post('/api/test', async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, message } = req.body;

    const enquiry = new Enquiry({
      name,
      email,
      phone,
      bloodGroup,
      message
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Enquiry saved successfully!',
      data: enquiry
    });

  } catch (error) {
    console.error('Error saving enquiry:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to save enquiry'
    });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });