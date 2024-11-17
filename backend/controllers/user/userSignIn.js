const bcrypt = require('bcryptjs')
const userModel = require('../../models/userModel')
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function userSignInController(req,res)
{
    try{
        const { email , password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error("Please provide a valid email");
        }
        if (!password || password.length < 8) {
            throw new Error("Password should be at least 8 characters long");
        }

        const user = await userModel.findOne({email})

        if(!user)
        {
            throw new Error("User not found")
        }

       const checkPassword = await bcrypt.compare(password,user.password)

        if(checkPassword)
        {
        const tokenData = {
            _id : user._id,
            email : user.email,
            role: user.role
        }

        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 8 });

        const tokenOption = {
            httpOnly : true,
            secure : true,
            sameSite : 'None'
        }

        res.cookie("token",token,tokenOption).status(200).json({
            message : "Login successfully",
            data: {
                token,  
                name: user.name,  
                email: user.email,
                isConfirmed: user.isConfirmed
            },
            success : true,
            error : false
        })

        }
        else
        {
         throw new Error("Please check Password");
        }
    }
    catch(err)
    {
        res.json({
            message : err.message || err,
            error : true,
            success : false,
        })
    }
}

module.exports = userSignInController