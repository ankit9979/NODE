const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            max: 500,
        },
        img: {
            type: String,
        },
        likes: {
            type: Array,
            default: [],
        },
    },
    { timestamps: true }
);

PostSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.userId;
    delete obj.createdAt;
    delete obj.updatedAt;
    delete obj.likes;
    return obj;
}
module.exports = mongoose.model("Post", PostSchema);