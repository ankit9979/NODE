const router = require("express").Router();
const Post   = require("../models/post");
const User   = require("../models/user");
const {auth} = require('../middlewares/auth');
var fs       = require('fs');

router.post("/add", auth, async(req, res) => {
    User.findByToken(req.token, async(err, user) => {
        req.body.userId = user._id;

        let fileUpload, uploadPath;

        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).json(
                {
                    success: false,
                    message: "No files were uploaded."
                })
        }

        fileUpload = req.files.post_img;

        const allowedFiles = ['png', 'jpeg', 'jpg', 'gif'];
        const allowedType  = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

        const extension = fileUpload.name.slice(
            ((fileUpload.name.lastIndexOf('.') - 1) >>> 0) + 2
        );

        if (!allowedFiles.includes(extension)) {
            return res.json(
                {
                    success: false,
                    message: "Invalid Image"
                })
        }

        var dt = new Date();

        var yearMonth = dt.getFullYear() + "/" + (dt.getMonth() + 1);

        uploadPath = '../social-api/uploads/posts/'+ yearMonth;

        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        uploadPath = uploadPath + new Date().getTime() + '_' + fileUpload.name;

        fileUpload.mv(uploadPath, function(err) {
            if (err)
                res.json(
                    {
                        success: false,
                        message: "Something went wrong while upload post image."
                    }
            );
        });

        req.body.img = uploadPath;

        const newPost = new Post(req.body);

        try {
            const savedPost = await newPost.save();
            res.status(201).json(
                {
                    success: true,
                    message: "Post Added Successfully"
                }
            );
        } catch (err) {
            res.status(500).json(
                {
                    success: false,
                    message: err
                }
            );
        }
    });
});

router.put("/update/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post) {

            if (req.files && Object.keys(req.files).length !== 0) {
                let fileUpload, uploadPath;

                var dt = new Date();

                var yearMonth = dt.getFullYear() + "/" + (dt.getMonth() + 1);

                fileUpload = req.files.post_img;
                uploadPath = '../social-api/uploads/posts/'+ yearMonth;

                const allowedFiles = ['png', 'jpeg', 'jpg', 'gif'];

                const extension = fileUpload.name.slice(
                    ((fileUpload.name.lastIndexOf('.') - 1) >>> 0) + 2
                );

                if (!allowedFiles.includes(extension)) {
                    return res.json(
                        {
                            success: false,
                            message: "Invalid Image"
                        })
                }

                if (!fs.existsSync(uploadPath)){
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                uploadPath = uploadPath + new Date().getTime() + '_' + fileUpload.name;

                fileUpload.mv(uploadPath, function(err) {
                    if (err)
                        return res.json(
                            {
                                success: false,
                                message: "Something went wrong while upload post image"
                            }
                    );
                });

                req.body.img = uploadPath;
            }

            await post.updateOne({ $set: req.body });
            res.status(200).json(
                {
                    success: true,
                    message: "The post has been updated"
                }
            );
        } else {
            res.status(404).json(
                {
                    success: true,
                    message: "No Post Found"
                }
            );
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post) {
            await post.deleteOne();
            res.status(200).json(
                {
                    success: true,
                    message: "The post has been deleted"
                }
            );
        } else {
            res.status(404).json(
                {
                    success: false,
                    message: "No post found"
                }
            );
        }
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                message: err
            }
        );
    }
});

/**
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("The post has been liked");
        } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
 */
router.get("/view/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(
            {
                success: true,
                data: post
            }
        );
    } catch (err) {
        res.status(500).json(
            {
                success: false,
                message:err
            }
        );
    }
});


router.get("/myposts", auth,  async (req, res) => {
try {
    User.findByToken(req.token, async(err, user) => {
        const userPosts = await Post.find({ userId: user._id }).sort({ _id : -1});
        res.status(200).json(
            {
                success: true,
                data:userPosts
            }
        );
    });

} catch (err) {
    res.status(500).json(
        {
            success: false,
            message:err
        }
    );
}
});

module.exports = router;