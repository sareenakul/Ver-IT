const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLSchema, GraphQLNonNull} = require('graphql');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/user');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Tag = require('../models/Tag');

// USER TYPE
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        posts: {type: new GraphQLList(PostType)}
    })
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: GraphQLID},
        title: {type: GraphQLString},
        content: {type: GraphQLString},
        authorId: {type: GraphQLID},
        comments: {type: GraphQLList(CommentType)},
        likes: {type: GraphQLList(LikeType)},
        tags: {type: GraphQLList(TagType)}
    })
});

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({
        id: { type: GraphQLID },
        postId: { type: GraphQLID },
        authorId: { type: GraphQLID },
        content: { type: GraphQLString },
        createdAt: { type: GraphQLString }
    })
});

const LikeType = new GraphQLObjectType({
    name: 'Like',
    fields: () => ({
        id: { type: GraphQLID },
        postId: { type: GraphQLID },
        createdAt: { type: GraphQLString },
        likedByUserId: {type: GraphQLID}
    })
});

const TagType = new GraphQLObjectType({
    name: 'Tag',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        posts: { type: new GraphQLList(PostType) } // Reference to PostType
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args){
                return users;
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args){
                return posts;
            }
        },
        user: {
            type: UserType,
            args: {id: {type: GraphQLString}},
            resolve(parent, args){
                // return users.find(user => user.id === args.id);
                return User.findById(args.id);
            }
        },
        post: {
            type: PostType,
            args: { id: { type: GraphQLString } },
            resolve(parent, args) {
                return Post.findById(args.id);
                // return posts.find(post => post.id === args.id); // Return post by ID
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent, args) {
                return comments; // Return all comments
            }
        },
        likes: {
            type: new GraphQLList(LikeType),
            resolve(parent, args) {
                return likes; // Return all likes
            }
        },
        tags: {
            type: new GraphQLList(TagType),
            resolve(parent, args) {
                return tags; // Return all tags
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                const user = {
                    id: uuidv4(),
                    username: args. username,
                    email: args.email,
                    password: args.password,
                    createdAt: new Date().toISOString(),
                    posts: []
                };
                users.push(user);
                return user;
            }
        },
        addPost: {
            type: PostType,
            args: {
                title: {type: new GraphQLNonNull(GraphQLString)},
                content: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                const post = {
                    id: uuidv4(),
                    title: args.title,
                    content: args.content,
                    authorId: args.authorId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    comments: [],
                    likes: [],
                    tags: []
                };
                posts.push(post);
                return post;
            }
        },
        addComment: {
            type: CommentType,
            args: {
                postId: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLString)},
                content: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                const comment = {
                    id: uuidv4(),
                    postId: args.postId,
                    authorId: args.authorId,
                    content: args.content,
                    createdAt: new Date().toISOString()
                };
                comments.push(comment);
                return comment;
            }
        },
        addLike: {
            type: LikeType,
            args: {
                postId: {type: new GraphQLNonNull(GraphQLString)},
                likedByUserId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                const like = {
                    likeId: uuidv4(),
                    postId: args.postId,
                    likedByUserId: args.likedByUserId,
                    createdAt: new Date().toISOString()
                };
                likes.push(like);
                return like;
            }
        },
        addTag: {
            type: TagType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                postIds: {type: new GraphQLList(GraphQLString)}
            },
            resolve(parent, args){
                const tag = {
                    id: uuidv4(),
                    name: args.name,
                    posts: args.postIds ? args.postIds.map(postId => posts.find(post => post.id === postId)).filter(post => post): []
                };
                tags.push(tag);
                return tag;
            }
        }
    }
});


// CREATE SCHEMA
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});