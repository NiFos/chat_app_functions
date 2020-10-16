import "dotenv/config";
import express from "express";
import { auth } from "./functions/auth";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:8080", "http://localhost:3000"],
  })
);
app.use(bodyParser.json());
app.use("/auth", auth);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Dev server started!");
});
