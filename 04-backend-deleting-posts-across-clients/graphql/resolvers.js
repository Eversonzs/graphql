const userResolver = require('../resolvers/userResolver');
const postResolver = require('../resolvers/postResolver');

module.exports = {
    login: async function({email, password}){
        return userResolver.login({email, password});
    },

    createUser: async function({userInput}, req){
        return userResolver.createUser({userInput}, req);
    },

    createPost: async function({ postInput }, req){
        return postResolver.createPost({ postInput }, req);
    },

    posts: async function(arg, req){
        return postResolver.posts(arg, req);
    }

};