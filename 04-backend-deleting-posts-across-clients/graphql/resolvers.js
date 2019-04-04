const bcrypt = require('bcryptjs');
const validator = require('validator');

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

        if (errors.length >0 ){
            const error = new Error('Invalid input.');
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
    }
};