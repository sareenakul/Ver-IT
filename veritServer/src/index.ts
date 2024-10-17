import { ApolloServer } from '@apollo/server'; // preserve-line
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import {v4 as uuidv4} from 'uuid';
//Execute Command: npm run compile && node ./dist/index.js

let typeDefs: string;

try{
    typeDefs = readFileSync('./src/schema.graphql', 'utf-8');
} catch(error){
    console.error("Error Found in Schema.graphql: ", error);
    process.exit(1);
}


interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: string;
    posts: any[]; // You can also define a more specific type for posts if needed
}
let users: User[] = [];


interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    comments: any[]; // Define specific types if needed
    likes: any[];
    tags: any[];
}

let posts: Post[] = [];

interface Comment {
    id: string;
    postId: string; // A reference to the Post the comment belongs to
    authorId: string; // A reference to the User who wrote the comment
    content: string;
    createdAt: string;
}

let comments: Comment[] = [];

interface Like {
    id: string;
    postId: string; // A reference to the Post that was liked
    createdAt: string;
}

let likes: Like[] = [];

interface Tag {
    id: string;
    name: string;
    posts: Post[]; // Array of posts associated with the tag
}

let tags: Tag[] = [];



const resolvers = {
    Query: {
        users: () => users,
        posts: () => posts,
        post: (_: any, {id}: {id: String}) => posts.find(post => post.id === id),
        comments: (_: any, {postId}: {postId: String}) => comments.filter(comment => comment.postId === postId),
        tags: () => tags,
    },
    Mutation: {
        createUser: (_: any, {username, email, password}: {username: string, email: string, password: string}) => {
            const newUser: User = {id: uuidv4(), username, email, password, createdAt: new Date().toISOString(), posts: []};
            users.push(newUser);
            return newUser;
        },
        createPost: (_: any, {title, content, authorId}: {title: string, content: string, authorId: string}) => {
            const newPost: Post = {id: uuidv4(), title, content, authorId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [], likes: [], tags: []};
            posts.push(newPost);
            return newPost;
        },
        createComment: (_: any, {postId, authorId, content}: {postId: string, authorId: string, content: string}) =>{
            const newComment: Comment = {id: uuidv4(), postId, authorId, content, createdAt: new Date().toISOString() };
            comments.push(newComment);
            return newComment;
        },
        likePost: (_: any, {postId, userId }: {postId: string, userId: string}) =>{
            const newLike: Like = {id: uuidv4(), postId, createdAt: new Date().toISOString()};
            likes.push(newLike);
            return newLike;
        },
        createTag: (_: any, {name}: {name: string}): Tag =>{
            const newTag: Tag = {id: uuidv4(), name, posts: [] };
            tags.push(newTag);
            return newTag;
        },
    },
}


const server = new ApolloServer({
    typeDefs,
    resolvers,
});
  
startStandaloneServer(server, {
    listen: {port: 4000},
}).then(({url})=>{
    console.log("Server ready at " + url)
})


