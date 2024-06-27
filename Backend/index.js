import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dbConnetion from "./dbConfig/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./routes/index.js";
import path from "path";
// import bodyParser from "body-parser"

dotenv.config();

const app = express();

const __dirname = path.resolve(path.dirname(""));
app.use(express.static(path.join(__dirname, "dist")));
//express.static() is a built-in middleware function in Express. It serves static files such as HTML, CSS, JS, images, from the specified dir.

app.use(cors());
app.use(helmet()); //helps you secure HTTP headers returned by your Express apps.

app.use(express.json({ limit: "10mb" })); //preventing denial-of-service (DoS) attacks where an attacker might send excessively large payloads.

app.use(express.urlencoded({ extended: true })); //allows your Express app to parse complex, nested objects from URL-encoded form data.

app.use(morgan("dev"));
// Logs details about incoming HTTP requests.

app.use(router);

app.use(errorMiddleware); //error middleware

const PORT = process.env.PORT || 4001;
dbConnetion();

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
