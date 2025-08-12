import mongoose from "mongoose";

async function connectDb(){
    mongoose.connection.on('connected', () => console.log('MongoDB Connected'));
    await mongoose.connect(`${process.env.MONGODB_URI}/dtunes`)
}

export default connectDb