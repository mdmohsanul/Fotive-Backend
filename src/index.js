import connectDB from "./db/db.connect.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT;
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
    app.listen(PORT || 8000, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed ", error);
  });