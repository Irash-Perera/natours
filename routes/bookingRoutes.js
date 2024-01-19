const express = require('express');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.use(authController.protectRoute);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)

router.use(authController.restrictTo('admin', 'lead-guide'));
router.route('/')
  .post(bookingController.createBooking)
  .get(bookingController.getAllBookings)

router.route('/:id')
  .patch(bookingController.updateBooking)
  .get(bookingController.getBooking)
  .delete(bookingController.deleteBooking)
  
module.exports = router