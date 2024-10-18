const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: String, default: new Date().toISOString() },
    updatedAt: { type: String, default: new Date().toISOString() },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

module.exports = mongoose.model('Post', postSchema);