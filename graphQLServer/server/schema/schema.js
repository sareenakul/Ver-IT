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
        status: {type: GraphQLString},
        posts: {type: new GraphQLList(PostType),
            resolve(parent, args){
                return Post.find({authorId: parent.id});
            }
        }
    })
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: GraphQLID},
        title: {type: GraphQLString},
        content: {type: GraphQLString},
        authorId: {type: GraphQLID},
        comments: {type: new GraphQLList(CommentType),
            resolve(parent, args){
                return Comment.find({postId: parent.id});
            }
        },
        likes: {type: new GraphQLList(LikeType),
            resolve(parent, args){
                return Like.find({postId: parent.id});
            }
        },
        tags: {type: new GraphQLList(TagType),
            resolve(parent, args){
                return Tag.find({posts: parent.id});
            }
        }
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
        posts: { type: new GraphQLList(PostType),
            resolve(parent, args){
                return Post.find({tags: parent.id});
            }
         } // Reference to PostType
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args){
                //Finds all users
                return User.find()
            }
        },
        postsWithTagID: {
            type: new GraphQLList(PostType),
            args: {tagId: {type: GraphQLNonNull(GraphQLID)}},
            resolve(parent, args){
                return Post.find({tagId: args.tagId});
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args){
                return Post.find();
            }
        },
        postsByID: {
            type: new GraphQLList(PostType),
            args: {authorId: {type: GraphQLID}},
            resolve(parent, args){
                return Post.find({authorId: args.authorId}).then(posts => {
                    if(!posts.length){
                        throw new Error("User posts not found for this author!");
                    }
                    return posts;
                });
            }
        },
        // user by id Works perfect
        user: {
            type: UserType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                // return users.find(user => user.id === args.id);
                return User.findById(args.id);
            }
        },
        // post Works perfect for a postId
        post: {
            type: PostType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Post.findById(args.id);
                // return posts.find(post => post.id === args.id); // Return post by ID
            }
        },
        // comments returns all comments on a post
        comments: {
            type: new GraphQLList(CommentType),
            args: { postId: { type: GraphQLID}},
            resolve(parent, args) {
                return Comment.find(); // Return all comments
            }
        },
        likes: {
            type: new GraphQLList(LikeType),
            args: { postId: { type: GraphQLID}},
            resolve(parent, args) {
                return Like.find({postId: args.postId}); // Return all likes
            }
        },
        // Working Fine
        tag: {
            type: TagType,
            args: {tagId: {type: GraphQLID}},
            resolve(parent, args){
                return Tag.findById(args.tagId);
            }
        }
        ,
        tags: {
            type: new GraphQLList(TagType),
            args: { postId: { type: GraphQLID}},
            resolve(parent, args) {
                return Tag.find(); // Return all tags
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Works absolutely fine
        addUser: {
            type: UserType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                const user = new User({
                    id: uuidv4(),
                    username: args. username,
                    email: args.email,
                    password: args.password,
                    createdAt: new Date().toISOString(),
                    posts: []
                });
                return user.save();
            }
        },
        // Works absolutely fine
        addPost: {
            type: PostType,
            args: {
                title: {type: new GraphQLNonNull(GraphQLString)},
                content: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLString)},
                // tags: {type: new GraphQLList(Str)}
            },
            resolve(parent, args){
                const post = new Post({
                    id: uuidv4(),
                    title: args.title,
                    content: args.content,
                    authorId: args.authorId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    comments: [],
                    likes: [],
                    tags: []
                });
                return post.save();
            }
        },
        removeUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args) {
                const user = await User.findById(args.id);
                if (!user) {
                    throw new Error("User not found");
                }
        
                // Delete all posts by the user
                const posts = await Post.find({ authorId: args.id });
        
                // Delete all comments on the user's posts
                const postIds = posts.map(post => post._id);
                await Comment.deleteMany({ postId: { $in: postIds } });
        
                // Delete all likes on the user's posts
                await Like.deleteMany({ postId: { $in: postIds } });
        
                // Delete user's own comments on any posts
                await Comment.deleteMany({ authorId: args.id });
        
                // Delete user's likes on any posts
                await Like.deleteMany({ likedByUserId: args.id });
        
                // Delete all posts by the user
                await Post.deleteMany({ authorId: args.id });
        
                // Finally, delete the user
                return User.findByIdAndDelete(args.id);
            }
        },
        removePost: {
            type: PostType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args){
                const post = await Post.findById(args.id);
                if(!post){
                    throw new Error("Post not found!");
                }
                await Comment.deleteMany({ postId: args.id });

        // Delete all likes on this post
                await Like.deleteMany({ postId: args.id });

        // Delete the post
                return Post.findByIdAndDelete(args.id)
            }
        },
        removeComment: {
            type: CommentType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                return Comment.findByIdAndDelete(args.id).then(comment => {
                    if(!comment){
                        throw new Error("Comment not found!");
                    }
                    return comment;
                })
            }
        },
        removeLike: {
            type: LikeType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                return Like.findByIdAndDelete(args.id).then(like => {
                    if(!like){
                        throw new Error("Like not found!");
                    }
                    return like;
                })
            }
        },
        removeTagFromPost: {
            type: TagType,
            args: {
                postId: {type: new GraphQLNonNull(GraphQLID)},
                tagId: {type: new GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args){
                const tag = await Tag.findById(args.tagId);
                if(!tag){
                    throw new Error("Tag not found");
                }

                if(!tag.posts.includes(args.postId)){
                    throw new Error("Post ID not found in the tag's posts");
                }
                tag.posts = tag.posts.filter(postId => postId.toString() !== args.postId);

                return tag.save();
            }
        }
        ,
        addComment: {
            type: CommentType,
            args: {
                postId: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLString)},
                content: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                const comment = new Comment({
                    id: uuidv4(),
                    postId: args.postId,
                    authorId: args.authorId,
                    content: args.content,
                    createdAt: new Date().toISOString()
                });
                
                return comment.save();
            }
        },
        addLike: {
            type: LikeType,
            args: {
                postId: {type: new GraphQLNonNull(GraphQLString)},
                likedByUserId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                const like = new Like({
                    id: uuidv4(),
                    postId: args.postId,
                    likedByUserId: args.likedByUserId,
                    createdAt: new Date().toISOString()
                });
                return like.save();
            }
        },
        addTag: {
            type: TagType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                postIds: {type: new GraphQLList(GraphQLString)}
            },
            resolve(parent, args){
                return Post.find({_id: { $in: args.postIds}}).then(posts => {
                    const tag = new Tag({
                        id: uuidv4(),
                        name: args.name,
                        posts: posts
                    });
                    return tag.save();
                });
                
            }
        }
    }
});


// CREATE SCHEMA
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});