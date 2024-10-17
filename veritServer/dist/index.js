"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server"); // preserve-line
const standalone_1 = require("@apollo/server/standalone");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
//Execute Command: npm run compile && node ./dist/index.js
// const typeDefs = `#graphql
//   # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
//   # This "Book" type defines the queryable fields for every book in our data source.
//   type Book {
//     title: String
//     author: String
//   }
//   # The "Query" type is special: it lists all of the available queries that
//   # clients can execute, along with the return type for each. In this
//   # case, the "books" query returns an array of zero or more Books (defined above).
//   type Query {
//     books: [Book]
//   }
// `;
const typeDefs = (0, fs_1.readFileSync)('./src/schema.graphql', 'utf-8');
let users = [];
let posts = [];
let comments = [];
let likes = [];
let tags = [];
const resolvers = {
    Query: {
        users: () => users,
        posts: () => posts,
        post: (_, { id }) => posts.find(post => post.id === id),
        comments: (_, { postId }) => comments.filter(comment => comment.postId === postId),
        tags: () => tags,
    },
    Mutation: {
        createUser: (_, { username, email, password }) => {
            const newUser = { id: (0, uuid_1.v4)(), username, email, password, createdAt: new Date().toISOString(), posts: [] };
            users.push(newUser);
            return newUser;
        },
        createPost: (_, { title, content, authorId }) => {
            const newPost = { id: (0, uuid_1.v4)(), title, content, authorId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [], likes: [], tags: [] };
            posts.push(newPost);
            return newPost;
        },
        createComment: (_, { postId, authorId, content }) => {
            const newComment = { id: (0, uuid_1.v4)(), postId, authorId, content, createdAt: new Date().toISOString() };
            comments.push(newComment);
            return newComment;
        },
        likePost: (_, { postId, userId }) => {
            const newLike = { id: (0, uuid_1.v4)(), postId, createdAt: new Date().toISOString() };
            likes.push(newLike);
            return newLike;
        },
        createTag: (_, { name }) => {
            const newTag = { id: (0, uuid_1.v4)(), name, posts: [] };
            tags.push(newTag);
            return newTag;
        },
    },
};
// const books = [
//     {
//       title: 'The Awakening',
//       author: 'Kate Chopin',
//     },
//     {
//       title: 'City of Glass',
//       author: 'Paul Auster',
//     },
// ];
//   const resolvers = {
//     Query: {
//       books: () => books,
//     },
//   };
const server = new server_1.ApolloServer({
    typeDefs,
    resolvers,
});
(0, standalone_1.startStandaloneServer)(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log("Server ready at " + url);
});
