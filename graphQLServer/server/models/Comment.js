const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    content: {type: String, required: true},
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    createdAt: { type: String, default: new Date().toISOString() }
});

module.exports = mongoose.model('Comment', commentSchema);