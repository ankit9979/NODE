const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId, ref: 'User',
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

module.exports = mongoose.model("Post", PostSchema);