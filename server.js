const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Get Airwallex API token
async function getAirwallexToken() {
  try {
    const baseUrl = process.env.AIRWALLEX_ENV === 'prod' 
      ? 'https://api.airwallex.com' 
      : 'https://api-demo.airwallex.com';
    
    const response = await axios.post(
      `${baseUrl}/api/v1/authentication/login`,
      {},
      {
        headers: {
          'x-api-key': process.env.AIRWALLEX_API_KEY,
          'x-client-id': process.env.AIRWALLEX_CLIENT_ID
        }
      }
    );
    
    return response.data.token;
  } catch (error) {
    console.error('Error getting Airwallex token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Airwallex');
  }
}

// Function to generate a random UUID-like string
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
}

// Routes
app.get('/api/config', (req, res) => {
  // Return configuration for Airwallex client
  res.json({
    env: process.env.AIRWALLEX_ENV || 'demo',
    clientId: process.env.AIRWALLEX_CLIENT_ID
  });
});

// Create Payment Intent route
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Get token first
    const token = await getAirwallexToken();
    
    // Generate a unique request_id
    const requestId = generateUniqueId();
    
    // API URL based on environment
    const baseUrl = process.env.AIRWALLEX_ENV === 'prod' 
      ? 'https://api.airwallex.com' 
      : 'https://api-demo.airwallex.com';
    
    console.log('Creating payment intent with request_id:', requestId);
    
    // Create a real payment intent using Airwallex API
    const response = await axios.post(
      `${baseUrl}/api/v1/pa/payment_intents/create`,
      {
        amount: parseFloat(amount),
        currency: currency,
        merchant_order_id: `order-${Date.now()}`,
        descriptor: 'Google Pay Demo',
        request_id: requestId,  // Add the unique request_id here
        metadata: {
          source: 'google-pay-demo'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Payment intent created successfully');
    console.log(response)
    
    res.json({
      id: response.data.id,
      client_secret: response.data.client_secret,
      amount: response.data.amount,
      currency: response.data.currency
    });
  } catch (error) {
    console.error('Error creating payment intent:', 
      error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.response?.data?.message || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});