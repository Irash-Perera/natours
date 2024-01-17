const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require('./../utils/apiFeatures')

exports.deleteOne = model => catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('There is no such document with that ID', 404));
    };
    res.status(204).json({
        status: 'success'
    })
});


exports.updateOne = model => catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
});

exports.getAll = model => catchAsync(async (req, res, next) => {

    //To allow for nested GET reviews on tours
    let filter = {};
    if (req.params.tourId) {
        filter = {tour: req.params.tourId}
    }

    let features = new APIFeatures(model.find(filter), req.query);
    features.filter().sort().selectFields().paginate();
    
    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    })
});

exports.createOne = model => catchAsync(async (req, res, next) => {

    const doc = await model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: doc
        }
    })
});

exports.getOne = (model, popOptions) => catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) {
        query = query.populate(popOptions);
    }
    const doc = await query;

    if (!doc) {
        return next(new AppError('There is no document with that ID',404));
    }

    res.status(200).json({
        status: 'successful',
        data: {
            doc
        }
    })
    // const tour = tours.find(el => el.id === req.params.id * 1);
    
    // if (!tour) {
    //     return res.status(404).json({
    //         message: 'Could not find such tour!'
    //     })
    // }

    // res.status(200).json(=
    //     status: 'sucess',
    //     data: {
    //         tour
    //     }
    // })
})

