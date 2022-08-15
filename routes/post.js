const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const {auth} = require('../middlewares/auth');

router.post("/add", auth, async(req, res) => {
    User.findByToken(req.token, async(err, user) => {
        req.body.userId = user._id;
        const newPost = new Post(req.body);
        try {
            const savedPost = await newPost.save();
            res.json(
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

router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
        await post.updateOne({ $set: req.body });
        res.status(200).json("the post has been updated");
        } else {
        res.status(403).json("you can update only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete("/:id", async (req, res) => {
try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
    await post.deleteOne();
    res.status(200).json("the post has been deleted");
    } else {
    res.status(403).json("you can delete only your post");
    }
} catch (err) {
    res.status(500).json(err);
}
});

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

router.get("/:id", async (req, res) => {
try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
} catch (err) {
    res.status(500).json(err);
}
});


router.get("/all", async (req, res) => {
try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
    currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
    })
    );
    res.json(userPosts.concat(...friendPosts))
} catch (err) {
    res.status(500).json(err);
}
});

module.exports = router;