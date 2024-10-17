const { v4: uuidv4 } = require('uuid');

// Sample Users
const users = [
    {
        id: uuidv4(),
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        createdAt: new Date().toISOString(),
        posts: []
    },
    {
        id: uuidv4(),
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password456',
        createdAt: new Date().toISOString(),
        posts: []
    }
];

// Sample Posts
const posts = [
    {
        id: uuidv4(),
        title: 'My First Post',
        content: 'This is the content of my first post',
        authorId: users[0].id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        likes: [],
        tags: []
    },
    {
        id: uuidv4(),
        title: 'Another Post',
        content: 'This is another post by Jane',
        authorId: users[1].id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        likes: [],
        tags: []
    }
];

// Sample Comments
const comments = [
    {
        id: uuidv4(),
        postId: posts[0].id,
        authorId: users[1].id,
        content: 'Great post!',
        createdAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        postId: posts[1].id,
        authorId: users[0].id,
        content: 'Thanks for sharing!',
        createdAt: new Date().toISOString(),
    }
];

// Sample Likes
const likes = [
    {
        id: uuidv4(),
        postId: posts[0].id,
        createdAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        postId: posts[1].id,
        createdAt: new Date().toISOString(),
    }
];

// Sample Tags
const tags = [
    {
        id: uuidv4(),
        name: 'Technology',
        posts: [posts[0]]
    },
    {
        id: uuidv4(),
        name: 'Life',
        posts: [posts[1]]
    }
];

module.exports = { users, posts, comments, likes, tags };
