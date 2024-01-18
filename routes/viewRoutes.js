const express = require('express');
const viewController = require('./../controllers/viewController')
const authController = require('../controllers/authController')

const router = express.Router();

router.get('/',authController.isLoggedIn, viewController.getOverview );
router.get('/tour/:slug',authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.login);
router.get('/me', authController.protectRoute, viewController.getAccount);
router.get('/reset-my-password', viewController.passwordReset)
router.get('/signup', viewController.signup)
router.get('/forgot-password', viewController.forgotPassword);

router.post('/update-user-data',authController.protectRoute, viewController.updateUserData)

module.exports = router;