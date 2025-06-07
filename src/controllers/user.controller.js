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

const registerUser = asyncHandler(async (req, res) => {
  // get the user details
  // validation - not empty
  // check if the user is already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary
  // create user object
  // remove password and refresh token field from response
  // check for user creation
  // save the details to database

  const { userName, email, password } = req.body;

  // check if the user doesn't pass empty string
  if ([email, password, userName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // check if the user already exists or not
  // $ give access to many operator like and , or, etc
  const existeduser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existeduser) {
    throw new ApiError(409, "User already exists");
  }

  // entry on database
  const user = await User.create({
    email,
    password,
    userName: userName,
  });
  // check if the user details is save in db or not.
  // if save then we have to send to frontend by removing the password and access token field

  // select will use to remove fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const { email, userName, password } = req.body;

  if (!(userName || email)) {
    throw new ApiError(400, "username or password is required");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  }).select("+password");
  if (!user) {
    throw new ApiError(404, "user doesn't exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn Successfully"
      )
    );
});
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

const  getAllUsers = asyncHandler(async (req,res) => {
    const user = await User.find().select("-password -refreshToken")
      return res.status(200).json(new ApiResponse(
        200,
        user,
        "All users fetched successfuly"
      ))

})

const logoutUser = asyncHandler(async (req, res) => {
  // get userId
  // remove accesstoken from database
  // remove cookies from frontend

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // to find userId
  // we are using verifyJwt middleware, so from that we can get req.user
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});



export {
  loginWithGoogle,
  getCurrentUser,
  logoutUser,
  registerUser,
  loginUser,
  changeCurrentUserPassword,
  getAllUsers
};
