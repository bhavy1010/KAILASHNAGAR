const mongoose = require("mongoose")

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGODB_URI)

        console.log("MongoDB Connected")

        await fixTodayRoseIndexes()

    } catch (error) {

        // Don't let the server silently boot with no database - every
        // request would just hang/timeout later with a confusing error.
        // Fail loudly and immediately instead.
        console.error("MongoDB connection failed:", error.message)

        process.exit(1)

    }
}

// One-time cleanup: an older version of the TodayRose model had a unique
// index on `awardDate` alone, which only allowed one rose per day (for
// any student). It has since been replaced by a compound unique index on
// {studentId, awardDate} so multiple students can be awarded per day.
// Mongo does not drop old indexes automatically when a schema changes, so
// the stale single-field index is removed here on every startup.
const fixTodayRoseIndexes = async () => {
    try {
        const collection = mongoose.connection.collection("todayroses")
        const indexes = await collection.indexes()

        const staleIndex = indexes.find(
            (index) =>
                index.unique &&
                Object.keys(index.key).length === 1 &&
                index.key.awardDate === 1
        )

        if (staleIndex) {
            await collection.dropIndex(staleIndex.name)
            console.log(`Dropped stale TodayRose index: ${staleIndex.name}`)
        }
    } catch (error) {
        // Collection may not exist yet on a brand new database, that's fine.
        if (error.codeName !== "NamespaceNotFound") {
            console.log("TodayRose index cleanup skipped:", error.message)
        }
    }
}

module.exports = connectDB