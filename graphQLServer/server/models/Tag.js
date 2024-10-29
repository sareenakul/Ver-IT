const mongoose = require('mongoose');


const tagSchema = new mongoose.Schema({
    name: {type: String, required: true},
    createdAt: { type: String, default: new Date().toISOString() },
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
});

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;