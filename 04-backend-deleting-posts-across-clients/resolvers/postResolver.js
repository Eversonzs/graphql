
const validator = require('validator');

const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
    createPost: async function({ postInput }, req){
        if(!req.isAuth){
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        let errors = [];
        if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 5})){
            errors.push({message: 'Title is invalid.'})
        }
        if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 5})){
            errors.push({message: 'Content is invalid.'})
        }
        if(errors.length > 0 ){
            const error = new Error(errors[0].message);
            console.log("resolver error---", errors);
            error.data = errors;
            error.code = 422;
            throw error;
        }

        let user = await User.findById(req.userId);
        if(!user){
            let error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }
        let post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });
        let createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();
        return{
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        };
    },

    posts: async function({page}, req){
        if(!req.isAuth){
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        if(!page){
            page = 1;
        }
        const perPage = 2;
        const totalPosts = await Post.find().countDocuments();
        const posts = await Post.find()
        .sort({ createdAt: -1})
        .skip((page -1) * perPage)
        .limit(perPage)
        .populate('creator');

        return {posts: posts.map(post=>{
            return {
                ...post._doc,
                _id: post.id.toString(),
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString()    
            }
        }), totalPosts: totalPosts}
    }
};