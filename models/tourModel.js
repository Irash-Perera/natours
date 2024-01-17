const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name cannot be null!'],
        unique: true,
        trim: true,
        maxlength: [40, 'name must have less or equal 40 characters'],
        minlength: [5, 'name must have greater or equal 10 characters'],
        // validate: [validator.isAlpha , 'name only have characters']
    },
    duration: {
        type: Number,
        required: [true, 'duration cannot be null!']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'maximum group size cannot be null!']
    },
    difficulty: {
        type: String,
        required: [true, 'difficulty cannot be null!'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message:'difficulty must be either: easy, medium, difficult.'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be greater or equal to 1'],
        max: [5, 'rating must be less or equal to 5'],
        set: val=> Math.round(val*10)/10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'price cannot be null!']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {  //not works in updating
                return val < this.price;
            }
        },
        message: 'discount price must be lower than regular price'
    },
    summary: {
        type: String,
        trim: true //only works for strings, white spaces in the begining and the end will be removed
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'description cannot be null!']
    },
    imageCover: {
        type: String,
        required: [true, 'cover image cannot be null!']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]
    
},
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

// tourSchema.index({price: 1})
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });


tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//virtual population
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//embedding

// tourSchema.pre('save', async function (next){
//     const guidePromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidePromises);
//     next();
// })

// tourSchema.pre('save', function (next) {
//     console.log('The file is going to be saved!');
//     next();
// })

// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     console.log('File has been saved!');
//     next();
// })

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })

    this.start = Date.now();
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    next();
})

//AGGRIGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({
//         $match : {secretTour : {$ne : true}}
//     })
//     next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;