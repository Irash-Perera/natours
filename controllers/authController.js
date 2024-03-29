const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const crypto = require('crypto');
const Email = require('./../utils/email')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions ={
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions)

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}


exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    // console.log(url);
    await new Email(newUser, url).sendWelcome();

    // console.log(req.body)

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return next(new AppError('Please provide both email and password!',401));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.passwordValidation(password, user.password))) {
        return next(new AppError('Email or password is incorrect!', 401));
    }
    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email. Please check the email again or sign up!'));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    res.locals.token = resetToken;
    
    try {
        const resetURL = `${req.protocol}//${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your password reset token (valid only for 10 min)',
        //     message
        // });
        await new Email(user, resetURL).sendPasswordReset()

        res.status(200).json({
            status: 'success',
            message: 'Password reset token sent to email!',
        });

    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiresAt = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError(`There was an error sending the email. Try again! (${err.message})`, 500))
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) get the user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpiresAt: { $gt: Date.now() }
    });

    // 2) if the token has not expired set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired.', 400));
    }
    
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;

    await user.save();
    // 3) update changedPassword property for the user
    // 4) log the user in, send JWT
    createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync (async (req, res, next) => {
    // 1) get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) check if POSTed current password is correct
    if (!(await user.passwordValidation(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong!', 401));
    }

    // 3) if so update passowrd
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) log in user, send JWT
    createSendToken(user, 201, res);
});

exports.protectRoute = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    };
    //checking the availability of the token
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.',401))
    }
    //verifying the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //searching for the user to check whether the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user no longer exist. Please log in!', 401));
    }
    req.user = currentUser;
    res.locals.user = currentUser;

    //checking whether the password hass been changed after the issued token
    if (currentUser.changedPassword(decoded.iat)) {
        return next(new AppError('Password has been changed recently. Please login with new credentials!'))
    }
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next (new AppError('You do not have permission to perform this action!',403))
        }
        next();
    }
}

exports.isLoggedIn = (async (req, res, next) => {
    try {
        
        let token;
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
    
            //verifying the token
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        
            //searching for the user to check whether the user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }
        
            //checking whether the password hass been changed after the issued token
            if (currentUser.changedPassword(decoded.iat)) {
                return next()
            }
            
            //THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        };
        res.locals.user = undefined;
        next();
    } catch (error) {
        return next();
    }
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'user_loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success'
    });
}