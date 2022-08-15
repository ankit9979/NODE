const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");


//REGISTER
router.post("/register", (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).json(err)
    }
});

//LOGIN
router.post("/login", (req, res) => {
    try {
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
    } catch (err) {
        return res.status(500).json({
            success :true,
            message:"You are already logged in"
        });
}
});



module.exports = router;