const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Enquiry = require('./models/Enquiry');
const Donor = require('./models/Donor');
const BloodRequest = require('./models/BloodRequest');
const User = require('./models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// ================= SIGNUP API =================

app.post('/api/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully!'
    });

  } catch (error) {

    console.error(
      'Signup error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
});

// ================= LOGIN API =================

app.post('/api/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error(
      'Login error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Login failed'
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