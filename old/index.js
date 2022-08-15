const express      = require('express');
const mongoose     = require('mongoose');
const bodyparser   = require('body-parser');
const cookieParser = require('cookie-parser');
const db           = require('./config/config').get(process.env.NODE_ENV);
const User         = require('./models/user');
const {auth}       = require('./middlewares/auth');
const app          = express();

app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, { useNewUrlParser: true, useUnifiedTopology:true }, function(err) {
    if(err) console.log(err);
});

app.get('/',function(req,res){
    res.status(200).send('Welcome To Social APP');
});

// adding new user (sign-up route)
app.post('/api/register',function(req, res) {
    // taking a user
    const newuser = new User(req.body);

    if(newuser.password != req.body.password2)
    {
        return res.status(400).json({success : false, message : "password not match"});
    }

    User.findOne({email: newuser.email}, function(err, user) {

        if(user)
        {
            return res.status(400).json({ success : false, message : "email already exits"});
        }

        newuser.save((err) => {
            if(err)
            {
                console.log(err);
                return res.status(400).json({ success : false});
            }

            res.status(200).json({
                success : true,
                message : "You are successfully registered"
            });
        });
    });
});

// login user
app.post('/api/login', function(req, res) {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if(err) return  res(err);

        if(user)
        {
            return res.status(400).json({
                success :true,
                message:"You are already logged in"
            });
        }
        else
        {
            User.findOne({'email' : req.body.email}, function(err, user) {
                if(!user)
                {
                    return res.json({success : false, message : "Auth failed ,email not found"});
                }

                user.comparepassword(req.body.password, (err, isMatch) => {
                    if(!isMatch)
                    {
                        return res.json({ success : false, message : "password doesn't match"});
                    }

                    user.generateToken((err, user) => {

                        if(err)
                        {
                            return res.status(400).send(err);
                        }
                        res.cookie('auth', user.token).json({
                            success: true,
                            id    : user._id,
                            email : user.email
                        });
                    });
                });
            });
        }
    });
});

// get logged in user
app.get('/api/profile', auth, function(req, res) {
    res.json({
        success : true,
        data    : {
            id   : req.user._id,
            email: req.user.email,
            name : req.user.firstname + req.user.lastname
        }
    })
});

//logout user
app.get('/api/logout', auth, function(req,res) {
    req.user.deleteToken(req.token, (err, user) => {
        if(err) return res.status(400).send(err);
        return res.json(
            {
                success: true,
                message: "Logged Out"
            }
        );
    });
});

// listening port
const PORT = process.env.PORT||3000;
app.listen(PORT, ()=> {
    console.log(`app is live at ${PORT}`);
});