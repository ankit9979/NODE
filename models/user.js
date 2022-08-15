var mongoose = require('mongoose');

const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = process.env;
const salt   = 10;

const userSchema = mongoose.Schema({
    firstname:{
        type: String,
        required: true,
        maxlength: 100,
        min:3
    },
    lastname:{
        type: String,
        required: true,
        maxlength: 100,
        min:3
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password:{
        type:String,
        required: true,
        minlength:8
    },
    token:{
        type: String
    },
    profilePicture: {
        type: String,
        default: "",
    }
}, { timestamps: true });

userSchema.pre('save', function(next) {
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(salt, function(err, salt) {
            if(err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err);
                user.password  = hash;
                next();
            })

        })
    }
    else
    {
        next();
    }
});

userSchema.methods.comparepassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if(err) return cb(next);
        cb(null, isMatch);
    });
}

userSchema.methods.generateToken = function(cb) {
    var user  = this;
    var token = jwt.sign(user._id.toHexString(), config.SECRET);

    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    })
}

userSchema.statics.findByToken =  function(token, cb) {
    var user = this;

    jwt.verify(token, config.SECRET, async function(err, decode) {
    user.findOne({"_id": decode, "token" : token}, function(err, user) {
            if(err) return cb(err);
            cb(null, user);
        })
    })
};

userSchema.methods.deleteToken = function(token, cb) {
    var user = this;

    user.update({$unset : {token :1}}, function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    });
}


userSchema.methods.deleteUser = function(token, cb) {
    var user = this;

    jwt.verify(token, config.SECRET, function(err, decode) {
        console.log(decode,'e');
        user.findByIdAndRemove(decode)
        console.log(decode,'2e');
    })
}

module.exports = mongoose.model('User', userSchema);