const AppError = require('./../utils/appError')

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    } 
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
    }


const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }

        console.log('Error❌ ', err)
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!!!'
        })
         
    } 
    // Redered websites
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    }

    console.log('Error❌ ', err)
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    })

        
    }
    


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err,req,res)
    } else if (process.env.NODE_ENV === 'production') {
        // let error = { ...err };

        if (err.name === 'CastError') { //CAST ERROR
            err = new AppError(`Invalid ${err.path} : ${err.value}`, 400);
        }

        if (err.code === 11000) { //DUPLICATE VALUES
            err = new AppError(`Duplicate key value: "${err.keyValue.name}". Please change value!`, 400);
        }

        if (err.name === "ValidationError") { //VALIDATION ERROR
            const errors = Object.values(err.errors).map(el => el.message)
            err = new AppError(`Invalid data input!\n${errors.join('. ')}`, 400);
        }

        if (err.name === 'JsonWebTokenError') {
            err = new AppError('Invalid token. Please log in again!', 401)
        }

        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired! Please login again.',401))
        }

        sendErrorProd(err, req, res)
        
    }
}