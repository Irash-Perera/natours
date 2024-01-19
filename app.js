const path = require('path');
const express = require('express');
const morgan = require('morgan')
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./controllers/errorController')
const AppError = require('./utils/appError')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
//start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBLE MIDDLEWARES

//serving static files
app.use(express.static(`${__dirname}/public`)); 

//set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }))

//development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//limit requests from same IP
const limiter = rateLimit({
    max: 100, //adjust as needed
    windowMs: 3600 * 1000,
    message: 'Too many requests! Please try again in an hour'
})
app.use('/api', limiter)

//body parser, reading data from body into req.body
app.use(express.json({
    limit:'10kb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))

app.use(cookieParser());

//data data sanitization against NOSQL query injection
app.use(mongoSanitize());

//data sanitization agains XSS
app.use(xss())

//prevent from http parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'price',
        'difficulty',
        'maxGroupSize',
        'ratingsAverage',
        'ratingsQuantity '
    ]
}));

app.use(compression())

//requesting time
app.use((req, res, next) => {
    req.reqestTime = new Date().toISOString()
    next();
})

// app.use((req, res, next) => {
//     console.log(req.cookies)
//     next();
// })


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler)

module.exports = app;

