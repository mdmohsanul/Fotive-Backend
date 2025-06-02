import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();
// const allowedOrigins = [
//   "https://fotive.vercel.app", // Production frontend
//   "http://localhost:5173", // Dev frontend
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true, // Allow cookies
//   optionSuccessStatus: 200,
// };
const corsOptions = {
  origin:"https://fotive.vercel.app",
  credentials: true, // Allow cookies,
   optionSuccessStatus: 200,
}

app.use(cors(corsOptions));

// middleware for json data
app.use(express.json({ limit: "16kb" }));

// if data come from URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// images or files
app.use(express.static("public"));

// to read and set cookie to browser
app.use(cookieParser());

// ---------- routes -------------------

import userRouter from "./routes/user.routes.js";
import albumRouter from "./routes/album.routes.js";
import imageRouter from "./routes/images.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/albums", albumRouter);
app.use("/api/v1/albums", imageRouter);

app.use(errorHandler);
export { app };
