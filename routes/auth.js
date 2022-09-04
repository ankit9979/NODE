const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { check, validationResult } = require('express-validator');

//REGISTER
router.post("/register",
    [
        check('firstname')
        .not()
        .isEmpty()
        .withMessage('First Name must be atleast 3 characters long'),
        check('email', 'Email is required').not().isEmpty(),
        check('password', 'Password should be between 3 to 9 characters long')
        .not()
        .isEmpty()
        .isLength({ min:3, max:9 }),
    ],
    (req, res) => {

        const errors = validationResult(req);
		if (!errors.isEmpty()) {
		    return res.status(400).json({ success : false, errors: errors.array() });
		}
    try {

        const newuser = new User(req.body);
		res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
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

        let token;
        if (req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        } else {
            token = '';
        }

        User.findByToken(token, (err, user) => {
            if (err) return  res(err);

            if (user) {
                return res.status(400).json({
                    success :true,
                    message:"You are already logged in"
                });
            } else {
                User.findOne({'email' : req.body.email}, function(err, user) {
                    if(!user) {
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

							res.json({
                                success: true,
                                data : {
                                    id   : user._id,
                                    email: user.email,
                                    token: user.token
                                }
                            });
                        });
                    });
                });
            }
        });
    } catch (err) {
        return res.status(500).json({
            success :true,
            message:err
        });
}
});



module.exports = router;