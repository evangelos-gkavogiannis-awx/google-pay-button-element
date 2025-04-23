import { loadAirwallex, createElement } from 'airwallex-payment-elements';

// Get DOM elements directly (assuming index.html loads this script last or via `type="module"`)
const startPaymentBtn = document.getElementById('create-payment-btn');
const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const googlePayContainer = document.getElementById('google-pay-container');
const paymentResult = document.getElementById('payment-result');

// Handle button click
startPaymentBtn.addEventListener('click', startPayment);

async function startPayment() {
  try {
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;

    // Get payment intent from your server
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency })
    });

    const { id: intentId, client_secret: clientSecret } = await response.json();

    await setupAirwallexAndMount(intentId, clientSecret, amount, currency);

  } catch (err) {
    console.error('❌ Failed to start payment:', err);
    showResult('Could not start payment');
  }
}

async function setupAirwallexAndMount(intentId, clientSecret, amount, currency) {
  try {
    // Get config from your backend
    const res = await fetch('/api/config');
    const config = await res.json();

    await loadAirwallex({
      env: config.env,
      origin: window.location.origin,
      clientId: config.clientId,
      locale: 'en',
    });

    console.log('✅ Airwallex initialized');

    const element = await createElement('googlePayButton', {
      mode: 'payment',
      intent_id: intentId,
      client_secret: clientSecret,
      amount: {
        value: amount,
        currency: currency,
      },
      countryCode: 'GB', // Optional, useful for locale-specific buttons
      style: {
        buttonType: 'buy',
        buttonColor: 'black',
        buttonSizeMode: 'fill',
      },
    });

    await element.mount(googlePayContainer);

    element.on('onSuccess', () => {
      showResult('🎉 Payment successful!');
    });

    element.on('onError', (event) => {
      showResult('❌ Payment failed: ' + event.error.message);
    });

    element.on('onReady', () => {
      console.log('✅ Google Pay button is ready.');
    });

  } catch (err) {
    console.error('❌ Error showing Google Pay:', err);
    showResult('Could not mount Google Pay button');
  }
}

function showResult(message) {
  paymentResult.textContent = message;
  paymentResult.style.display = 'block';
}
