const {users, posts, likes} = require('../sampleData');

const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLSchema} = require('graphql');


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
        createdAt: { type: GraphQLString }
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
                return users.find(user => user.id === args.id);
            }
        },
        post: {
            type: PostType,
            args: { id: { type: GraphQLString } },
            resolve(parent, args) {
                return posts.find(post => post.id === args.id); // Return post by ID
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


// CREATE SCHEMA
module.exports = new GraphQLSchema({
    query: RootQuery
});