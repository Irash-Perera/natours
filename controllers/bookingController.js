const catchAsync = require("../utils/catchAsync");
const Tour = require('./../models/tourModel')
const Booking = require('./../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const factoryHandler = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the currenlty booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) create the checkout session
  const session = await stripe.checkout.sessions.create({
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      payment_method_types:["card"],
      mode:"payment",
      line_items:[
          {
              "price_data": {
              "currency" : "usd",
              "unit_amount" : tour.price * 100,
              "product_data" : {
                    "name" : `${tour.name} Tour`,
                    "description" : tour.summary,
                     "images" : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                }
              },
              "quantity": 1
          }
      ]}
    );

  // 3) create session as response
  res.status(200).json({
    status: 'success',
    session
  })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //FIX Temporary. not secure
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) {
    return next();
  }

  await Booking.create({
    tour,
    user,
    price
  })

  res.redirect(req.originalUrl.split('?')[0]);
})

exports.getAllBookings = factoryHandler.getAll(Booking);
exports.getBooking = factoryHandler.getOne(Booking)
exports.createBooking = factoryHandler.createOne(Booking);
exports.updateBooking = factoryHandler.updateOne(Booking);
exports.deleteBooking = factoryHandler.deleteOne(Booking);

