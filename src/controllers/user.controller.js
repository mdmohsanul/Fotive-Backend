import axios from "axios";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { oauth2client } from "../utils/googleConfig.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import dotenv from "dotenv";
dotenv.config();

const generateAccessAndRefreshTokens = async (userId) => {
  // find user
  // generate access and refresh token
  // save refresh token in database
  // return access and refresh token

  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // now we have to save in DB but there is pasword validation in model, so to skip we user validateBeforeSave method
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generatingrefresh and access tokens"
    );
  }
};

// const loginWithGoogle = asyncHandler(async (req, res) => {
//   const { code } = req.query;
//   if (!code) {
//     throw new ApiError(401, "Google Client Code is required");
//   }
//   const googleRes = await oauth2client.getToken(code);
//   oauth2client.setCredentials(googleRes.tokens);

//   const userRes = await axios.get(
//     `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
//   );

//   const { email, name, picture } = userRes.data;
//   let user = await User.findOne({ email });
//   if (!user) {
//     user = await User.create({
//       userName: name,
//       email,
//       avatar: picture,
//     });
//   }
//   const { _id } = user;

//   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
//     _id
//   );

//   const loggedInUser = await User.findById(_id).select(
//     "-password -refreshToken"
//   );

//   // send cookies
//   const options = {
//     httpOnly: true,
//     secure: true,
//   };
//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           user: loggedInUser,
//           accessToken,
//           refreshToken,
//         },
//         "User loggedIn Successfully"
//       )
//     );
// });

const loginWithGoogle = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) throw new ApiError(401, "Google Client Code is required");

  const googleRes = await oauth2client.getToken(code);
  oauth2client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  );
  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ userName: name, email, avatar: picture });
  }

  const { _id } = user;
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    _id
  );

  const loggedInUser = await User.findById(_id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    sameSite: "strict",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "current user fetched successfully"));
});

export { loginWithGoogle, getCurrentUser };
