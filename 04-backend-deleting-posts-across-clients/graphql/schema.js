const { buildSchema } = require('graphql')

const userSchema = require('../schemas/userSchema');
const postSchema = require('../schemas/postSchema');

module.exports = buildSchema(`
    ${userSchema}

    ${postSchema}

    type RootMutation{
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
    }

    type RootQuery{
        login(email: String!, password: String!): AuthData!
        posts(page: Int): PostData!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
 `
);