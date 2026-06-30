require("dotenv").config();
const connectDB = require("./db/db");
const User = require("./models/User");

const seedAdmin = async () => {

    try {

        await connectDB();

        const admin = await User.findOne({

            mobile: "9876543210"

        });

        if (admin) {

            console.log("Admin Already Exists");

            process.exit();

        }

        await User.create({

            name: "Super Admin",

            mobile: "9876543210",

            password: "admin123",

            role: "admin"

        });

        console.log("--------------------------------");

        console.log("Admin Created Successfully");

        console.log("--------------------------------");

        console.log("Mobile   : 9876543210");

        console.log("Password : admin123");

        console.log("--------------------------------");

        process.exit();

    } catch (error) {

        console.log(error);

        process.exit(1);

    }

};

seedAdmin();