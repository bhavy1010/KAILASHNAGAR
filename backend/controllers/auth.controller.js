const User = require("../models/User");

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({
            name,
            email,
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

        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {

            return res.status(400).json({
                success: false,
                message: "Invalid Email"
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
                email: user.email,
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