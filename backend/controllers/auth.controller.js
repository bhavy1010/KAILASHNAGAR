const User = require("../models/User");

const registerUser = async (req, res) => {

    try {

        const {
            name,
            mobile,
            password,
            role
        } = req.body;

        const existingUser =
            await User.findOne({ mobile });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({
            name,
            mobile,
            password,
            role
        });

        res.status(201).json({
            success: true,
            message: "User Registered",
            user
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {

    try {

        const { mobile, identifier, password } = req.body

        const loginMobile = mobile || identifier

        if (!loginMobile) {

            return res.status(400).json({
                success: false,
                message: "Invalid Mobile Number"
            })

        }

        const user = await User.findOne({ mobile: loginMobile })

        if (!user) {

            return res.status(400).json({
                success: false,
                message: "Invalid Mobile Number"
            })

        }

        const isMatch =
            await user.comparePassword(password)

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            })

        }

        const token =
            user.generateAuthToken()

        res.status(200).json({

            success: true,
            message: "Login Successful",
            token,

            user: {

                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role

            }

        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            success: false,
            message: error.message
        })

    }

}


module.exports = {
    registerUser,
    loginUser
}