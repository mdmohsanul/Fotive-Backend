import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionSuccessStatus: 200,
};

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

export { app };
