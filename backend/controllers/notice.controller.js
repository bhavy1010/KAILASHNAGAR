const Notice =
require("../models/Notice");

const createNotice =
async (req, res) => {

    try {

        const notice =
        await Notice.create(
            req.body
        );

        res.status(201).json({

            success: true,
            notice

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getAllNotices =
async (req, res) => {

    try {

        const notices =
        await Notice.find()
        .sort({
            createdAt: -1
        });

        res.status(200).json({

            success: true,

            count:
            notices.length,

            notices

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createNotice,

    getAllNotices

};