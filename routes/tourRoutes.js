const express = require('express')
const tourController = require('./../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);
// const middleware = tourController.checkBreview

router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheap')
    .get(tourController.aliasTopTours,tourController.getAllTours)

router.route('/tour-stats')
    .get(tourController.tourStats)

router.route('/monthly-plan/:year')
    .get(authController.protectRoute, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

router.route('/distance/:latlng/unit/:unit')
    .get(tourController.getDistances);

router.route('/')
    .get(tourController.getAllTours)
    .post(authController.protectRoute, authController.restrictTo('admin', 'lead-guide'),tourController.createTour)

router.route('/:id')
    .get(tourController.getTour)
    .patch(authController.protectRoute,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImage,
        tourController.updateTour)
    .delete(authController.protectRoute, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

// router.route('/:tourId/reviews')
//     .post(authController.protectRoute, authController.restrictTo('user'), reviewController.createReview)

module.exports = router;
