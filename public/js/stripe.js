import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alert';

// Initialize Stripe
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);

export const bookTour = async tourId => {
  try {
    // 1) get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) create checkout form + charge credit card
    window.location.href = session.data.session.url;

  } catch (error) {
    // console.log(error);
    showAlert('error', error.message);
  }
};

