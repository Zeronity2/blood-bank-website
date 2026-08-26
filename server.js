const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Enquiry = require('./models/Enquiry');
const Donor = require('./models/Donor');
const BloodRequest = require('./models/BloodRequest');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

//Enquiry API
app.post('/api/enquiries', async (req, res) => {
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

// Donor API
app.post('/api/donors', async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      bloodGroup,
      phone,
      email,
      city,
      lastDonation,
      available
    } = req.body;

    const donor = new Donor({
      name,
      age,
      gender,
      bloodGroup,
      phone,
      email,
      city,
      lastDonation,
      available
    });

    await donor.save();

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully!',
      data: donor
    });

  } catch (error) {
    console.error('Error saving donor:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to register donor'
    });
  }
});

// Find Donors API
app.get('/api/donors', async (req, res) => {
  try {
    const { bloodGroup, city, available } = req.query;

    const filter = {};

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: 'i'
      };
    }

    if (available !== undefined && available !== '') {
      filter.available = available === 'true';
    }

    const donors = await Donor.find(filter)
      .select('name bloodGroup city available');

    res.json({
      success: true,
      count: donors.length,
      data: donors
    });

  } catch (error) {
    console.error('Error searching donors:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to search donors'
    });
  }
});

// Blood Request API
app.post('/api/blood-requests', async (req, res) => {
  try {
    const {
      patientName,
      contactName,
      bloodGroup,
      units,
      phone,
      email,
      city,
      hospital,
      requiredDate,
      urgency,
      message
    } = req.body;

    const bloodRequest = new BloodRequest({
      patientName,
      contactName,
      bloodGroup,
      units,
      phone,
      email,
      city,
      hospital,
      requiredDate,
      urgency,
      message
    });

    await bloodRequest.save();

    res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully!',
      data: bloodRequest
    });

  } catch (error) {
    console.error('Error saving blood request:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to submit blood request'
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