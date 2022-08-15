const router = require("express").Router();
const User   = require("../models/user");
const bcrypt = require("bcrypt");
const {auth} = require('../middlewares/auth');



router.get('/profile', auth, function(req, res) {
    res.json({
        success : true,
        data    : {
            id   : req.user._id,
            email: req.user.email,
            name : req.user.firstname + " " + req.user.lastname
        }
    })
});

router.post("/update", auth, (req, res) => {

    if (req.body.password) {
        if(req.body.password != req.body.password2)
        {
            return res.status(400).json({success : false, message : "password not match"});
        }
        try {
            const salt =  bcrypt.genSalt(10);
            req.body.password =  bcrypt.hash(req.body.password, salt);
        } catch (err) {
            return res.status(500).json(err);
        }
    }

    User.findByToken(req.token, (err, user) => {

        User.findByIdAndUpdate(user._id, {
            $set: req.body
        }, function (err)
        {
            if(!err)
            return res.json(
                {
                    success: true,
                    message: "Profile Updated"
                }
            );
        });
    });

});


router.get('/logout', auth, function(req, res) {
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

router.delete('/delete', auth,  function(req,res) {
    try {
        User.findByToken(req.token, (err, user) => {

            if(err)
            {
                return res.status(400).json(
                    {
                        success: false,
                        message:err
                    });
            }

            try {
                User.findByIdAndRemove(user._id, function(err){
                    if(err)
                    {
                        return res.json(
                            {
                                success: false,
                                message: err
                            })
                    } else {
                        return res.json(
                            {
                                success: true,
                                message: "Account has been deleted"
                            })
                    }
                });
            } catch (err) {
            return res.status(500).json(err);
            }
        });

    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;