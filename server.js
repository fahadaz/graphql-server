const express = require("express");
const expressGraphQL = require("express-graphql");
const app = express();
const schema = require('./schema.js');

app.use('/graphql', expressGraphQL({
                schema: schema,
                graphiql:true
}));

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("Server is running on port %s:%s ...",process.env.IP, process.env.PORT);
})