const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter name!']
    },
    email: {
        type: String,
        required: [true, 'Please enter email!'],
        unique: true,
        lowercase:true,
        validate: [validator.isEmail, 'Please enter a valid email!']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,   
        enum: ['user','guide','lead-guide','admin'],
        default:  'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter the password!'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm the password!'],
        validate: {
            validator: function (passwordConfirm) {
                return passwordConfirm === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetTokenExpiresAt: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
        // select: false
    }
    
});

userSchema.methods.passwordValidation = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPassword =  function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const passwordChangedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < passwordChangedTime  //300 < 200
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpiresAt = Date.now() + 60 * 10 * 1000;

    console.log({ resetToken }, this.passwordResetToken);

    return resetToken;
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})


const User = mongoose.model('User', userSchema);  

module.exports = User;