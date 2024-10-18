const mongoose = require('mongoose');


const likeSchema = new mongoose.Schema({
    likedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: String, default: new Date().toISOString() },
    postId: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true}
});

module.exports = mongoose.model('Like', likeSchema);