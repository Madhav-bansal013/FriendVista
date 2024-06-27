import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log("Db connected successfully");
    } catch (error) {
        console.error(`Db connection error:` + error);
    }
};
export default dbConnection;
