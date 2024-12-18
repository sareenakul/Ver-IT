const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLSchema, GraphQLNonNull, GraphQLEnumType, GraphQLInt} = require('graphql');
const { v4: uuidv4 } = require('uuid');


const User = require('../models/user');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Tag = require('../models/Tag');
const { tags } = require('../sampleData');

const UserStatusEnum = new GraphQLEnumType({
    name: 'UserStatus',
    values: {
        ONLINE: { value: 'Online' },
        OFFLINE: { value: 'Offline' },
        DND: { value: 'DND' }
    }
});

// USER TYPE
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        status: {type: UserStatusEnum},
        posts: {type: new GraphQLList(PostType),
            resolve(parent, args){
                return Post.find({authorId: parent.id});
            }
        },
        // Returns the count of posts for each user correctly
        postsByUserCount: {
            type: GraphQLInt,
            resolve(parent, args){
                return Post.countDocuments({authorId: parent.id});
            }
        },
        //Works Fine by showing all the comments the user ever made.
        commentsByUser: {
            type: new GraphQLList(CommentType),
            resolve(parent, args){
                return Comment.find({authorId: parent.id});
            }
        },
        // Works fine!
        countComments: {
            type: GraphQLInt,
            resolve(parent, args) {
                return Comment.countDocuments({ authorId: parent.id });
            }
        },
        //Works Perfect
        likedPosts: {
            type: new GraphQLList(PostType),
            resolve(parent, args){
                return Like.find({likedByUserId: parent.id}).then(likes => {
                    const postIds = likes.map(like => like.postId);
                    return Post.find({_id: {$in: postIds}});
                });
            }
        }
    })
})

//Need to set up elements for a profile/bio.


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
        },
        //works perfect
        likesCount:{
            type: GraphQLInt,
            resolve(parent, args) {
                return Like.countDocuments({ postId: parent.id });
            }
        },
        commentsCount:{
            type: GraphQLInt,
            resolve(parent, args) {
                return Comment.countDocuments({ postId: parent.id });
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
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                return Post.find({ tags: parent.id }); // Assuming tags is an array of tag IDs in the Post model
            }
        },
        postsCount: { // Field to count the number of posts associated with this tag
            type: GraphQLInt,
            async resolve(parent, args) {
                const count = await Post.countDocuments({tags: parent.id});
                return count;
                //return Post.countDocuments({ tags: parent.id }); // Count posts that include this tag ID
            }
        }
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
                return Like.find({postId: args.postId}); // Return all likes on a post
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
                password: {type: new GraphQLNonNull(GraphQLString)},
                status: {type: UserStatusEnum}
            },
            resolve(parent, args){
                const user = new User({
                    id: uuidv4(),
                    username: args. username,
                    email: args.email,
                    password: args.password,
                    createdAt: new Date().toISOString(),
                    posts: [],
                    status: args.status || 'Offline'
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
                tagIds: { type: new GraphQLList(GraphQLID) }
                // tags: {type: new GraphQLList(Str)}
            },
            async resolve(parent, args){
                const post = new Post({
                    id: uuidv4(),
                    title: args.title,
                    content: args.content,
                    authorId: args.authorId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    comments: [],
                    likes: [],
                    tags: args.tagIds
                });
                return await post.save();
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
        },
        //works perfect
        updateUserStatus: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID)},
                status: {type: new GraphQLNonNull(UserStatusEnum)}
            },
            resolve(parent, args){
                return User.findByIdAndUpdate(
                    args.id,
                    { status: args.status},
                    {new: true}
                ).then(user => {
                    if(!user){
                        throw new Error("User not found");
                    }
                    return user;
                });
            }
        },
        //works perfect
        updateUser: {
            type: UserType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                username: {type: GraphQLString},
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                status: {type: UserStatusEnum}
            },
            resolve(parent, args){
                const updates = {};
                if(args.username){
                    updates.username = args.username;
                }
                if(args.email){
                    updates.email = args.email;
                }
                if(args.password){
                    updates.password = args.password;
                }
                if(args.status){
                    updates.status = args.status;
                }

                return User.findByIdAndUpdate(
                    args.id,
                    updates,
                    {new: true}
                ).then(user => {
                    if(!user){
                        throw new Error("User not found");
                    }
                    return user;
                });
            }
        },
        //works perfect
        updatePost: {
            type: PostType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                title: {type: GraphQLString},
                content: {type: GraphQLString},
                tags: {type: new GraphQLList(GraphQLString)}
            },
            resolve(parent, args){
                const updates = {};
                if (args.title){ 
                    updates.title = args.title;
                }
                if (args.content){ 
                    updates.content = args.content;
                }
                if (args.tags){ 
                    updates.tags = args.tags;
                }
                return Post.findByIdAndUpdate(
                    args.id,
                    updates,
                    {new: true}
                ).then(post => {
                    if(!post){
                        throw new Error("Post not found")
                    }
                    return post;
                });
            }
        },
        //works perfect
        toggleLike: {
            type: LikeType,
            args: {
                postId: {type: new GraphQLNonNull(GraphQLID)},
                likedByUserId: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                return Like.findOne({postId: args.postId, likedByUserId: args.likedByUserId}).then(existingLike => {
                    if(existingLike){
                        return Like.findByIdAndDelete(existingLike.id).then(() =>{
                            return existingLike;
                        });
                    } else{
                        const newLike = new Like({
                            id: uuidv4(),
                            postId: args.postId,
                            likedByUserId: args.likedByUserId,
                            createdAt: new Date().toISOString()
                        });
                        return newLike.save();
                    }
                });
            }
        },
        //Works perfect
        updateComment: {
            type: CommentType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                content: {type: new GraphQLNonNull(GraphQLString)} //updated content
            },
            resolve(parent, args){
                return Comment.findByIdAndUpdate(
                    args.id,
                    {content: args.content},
                    {new: true}
                ).then(comment => {
                    if(!comment){
                        throw new Error("Comment not found");
                    }
                    return comment;
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