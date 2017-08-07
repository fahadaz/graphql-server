const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

//Customer Type
const CustomerType = new GraphQLObjectType({
    name:'Customer',
    fields:()=> ({
        Id: {type:GraphQLString},
        Name: {type:GraphQLString},
        Email: {type:GraphQLString}
    })
});

const RootQuery = new GraphQLObjectType({
    name:'RootQueryType',
    fields:{
        customer:{
            type:CustomerType,
            args:{
                Id:{type:GraphQLString}
            },
            resolve(parentValue, args, session){
                
                let config = {
                    headers: {'Authorization': 'Bearer '+ session.session.payload.access_token}
                };

                let url = session.session.payload.instance_url +'/services/data/v39.0/query/?q='+ encodeURIComponent("SELECT Id,Name, Email FROM Contact WHERE Id='"+args.Id+"'");
                return axios.get(url, config)
                .then(res => {
                    console.log(res.data);
                    if(res.data.totalSize == 1){
                    return res.data.records[0];
                    }
                    return null;
                });
            }
        },
        customers:{
            type: new GraphQLList(CustomerType),
            resolve(parentValue,args, session){
                console.log('----->>>------>>>-----');
                let config = {
                    headers: {'Authorization': 'Bearer '+ session.session.payload.access_token}
                };

                let url = session.session.payload.instance_url +'/services/data/v39.0/query/?q='+ encodeURIComponent('SELECT Id,Name, Email FROM Contact LIMIT 100');
                return axios.get(url, config)
                .then(res => {
                    console.log(res.data.records);
                    return res.data.records;
                });
            }
        }
    }
    
});

module.exports = new GraphQLSchema({
    query: RootQuery
});