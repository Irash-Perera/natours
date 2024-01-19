const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');

//WRITING FILE TO THE DISK

// const multerStorageDisk = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         cb(null, `user-${req.user.id}--${Date.now()}.${file.mimetype.split('/')[1]}`)
//     }
// });

//KEEP FILE IN MEMORY
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    req.file.filename = `user-${req.user.id}--${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)
    
    next();
});

const filterObj = (obj, ...fields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (fields.includes(el)) {
            newObj[el] = obj[el];
        }
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.file);
    // console.log(req.body);
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Password cannot be changed in this route. Update your password on /updatePassword', 400));
    };

    const filteredObj = filterObj(req.body, 'name', 'email');
    if (req.file) {
        filteredObj.photo = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
        new: true,
        runValidators: true
    })
    // console.log(filteredObj)
    
    res.status(200).json({
        status: 'success',
        user: updatedUser
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    })
});


exports.createUser = (req, res, next) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please try /signup'
    })
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

