const express = require('express');
const viewController = require('./../controllers/viewController')
const authController = require('../controllers/authController')
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get('/',bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview );
router.get('/tour/:slug',authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.login);
router.get('/me', authController.protectRoute, viewController.getAccount);
router.get('/my-tours', authController.protectRoute, viewController.getMyTours)
router.get('/reset-my-password', viewController.passwordReset)
router.get('/signup', viewController.signup)
router.get('/forgot-password', viewController.forgotPassword);
router.get('/post-review/:tourId', authController.protectRoute, viewController.postReview)

router.post('/update-user-data',authController.protectRoute, viewController.updateUserData)

module.exports = router;