import "dotenv/config";
import express from "express";
import { auth } from "./functions/auth";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/auth", auth);

app.listen(3000, () => {
  console.log("Dev server started!");
});
