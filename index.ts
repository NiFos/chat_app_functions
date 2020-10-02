import express from "express";
import { auth } from "./functions/auth";

const app = express();

app.use("/auth", auth);

app.listen(3000, () => {
  console.log("Dev server started!");
});
