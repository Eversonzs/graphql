const bcrypt = require('bcryptjs');
const validator = require('validator');
const jsonWebToken = require('jsonwebtoken');

const User = require('../models/user');

module.exports = {
    createUser: async function(/* args */{userInput}, req){
        //const email = args.userInput.email;
        const email = userInput.email
        let errors = [];
        if(!validator.isEmail(email)){
            errors.push({message: "Email is invalid", code: 422})
        }
        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 5})){
            errors.push({message: "Password to short!", code: 400})
        }

        if (errors.length > 0 ){
            const error = new Error(errors[0].message);
            console.log("resolver error---", errors);
            error.data = errors;
            throw error;
        }

        const existingUser = await User.findOne({email: email});
        if(existingUser){
            const error = new Error('User exists already!');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: email,
            name: userInput.name,
            password: hashedPassword
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };
    },

    login: async function({email, password}){
        let user = await User.findOne({email: email});
        if(!user){
            let error = new Error('User not found.');
            error.code = 401;
            throw error;
        }
        let passwordEqual = await bcrypt.compare(password, user.password);
        if(!passwordEqual){
            let error = new Error('Password is incorrect!');
            error.code = 401;
            throw error;
        }
        let token = jsonWebToken.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'someSuperSecret', { expiresIn: '1h' })
       
        return { token: token, userId: user._id.toString() };
    }

};