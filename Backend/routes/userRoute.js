import express from "express";
import path from "path";
import { verifyEmail } from "../controllers/userController.js";

const router = express.Router();

const __dirname = path.resolve(path.dirname(""));

// resolve a sequence of paths into an absolute path.The path.dirname method returns the directory name of a path.

//Path module is used to work for differnt path in different os.

router.get("/verify/:userId/:token", verifyEmail);
//this is the link in the mail when we trigger that then this function executes and redirect to verified route where index.html served

router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});

//path.join is used to create full path from this file to index.html file
//This file will be served to the client, and it will load the React application when verified route is called.

export default router;
