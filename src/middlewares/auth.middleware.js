import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import dotenv from "dotenv"
import { User } from "../models/user.model.js"
dotenv.config()


export const verifyJWT =  asyncHandler(async (req,_,next) => {
   
        // get access token 
        const token = req.cookies.accessToken || req.header("Authorization").replace("Bearer","").trim();

        if(!token){
            throw new ApiError(401, "Unauthorized error");
        }
        // decode the token to extract the user id
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        // find user
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid access token");
          }
        
          req.user = user;
          next();
   
})