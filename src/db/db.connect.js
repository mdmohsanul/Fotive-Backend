import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const mongo_URI = process.env.MONGODB_URI

const connectDB = async() => {
    try{
   const connection  = await mongoose.connect(mongo_URI);
   if (connection) {
    console.log(`DATABASE connected`)
  }
  
    }catch(error){
        console.log("MONGODB connection FAILED: ",error)
        process.exit(1)
    }
}

export default connectDB