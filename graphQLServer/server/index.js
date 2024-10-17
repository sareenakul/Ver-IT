require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql'); // Correct import
const schema = require('./schema/schema');
const port = process.env.PORT || 5000;
const app = express();

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development'
}));

app.listen(port, () => {
  console.log(`Server running on: ${port}`);
});
