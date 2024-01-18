const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel')

exports.getOverview = catchAsync(async(req, res) => {
    // 1) Get tour data from the collection
    const tours = await Tour.find();

    // 2) Build the template


    // 3) Render the template using the data from 1
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});

exports.getTour = catchAsync(async(req, res, next) => {

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200)
        .set('Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;")
        .render('tour', {
        title: tour.name,
        tour
    });
});

exports.login = (req, res) => {
    res.status(200).render('login', {
        title: 'Login'
    })
}

exports.signup = (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Sign up'
    });
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My account',
    })
}

exports.updateUserData = catchAsync(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
        {
            new: true,
            runValidators: true
        });
    
    res.status(200).render('account', {
        title: 'My account',
        user: user
    })
})

exports.passwordReset = (req, res, next) => {
    res.status(200).render('resetPassword', {
        title:'Reset Password'
    })
}

exports.forgotPassword = (req, res, next) => {
    res.status(200).render('forgotPassword', {
        title: 'Forgotten password'
    });
}