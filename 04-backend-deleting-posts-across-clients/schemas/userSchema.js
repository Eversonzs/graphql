module.exports = userSchema = `
type User{
    _id: ID!
    email: String!
    name: String!
    password: String
    status: String!
    posts: [Post!]!
}

type AuthData{
    token: String!
    userId: String!
}

input UserInputData{
    email: String!
    name: String!
    password: String!
}

`;