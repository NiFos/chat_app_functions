import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getUserId } from "../utils/jwt";
export async function me(req: Request, res: Response): Promise<Response> {
  const token = req.headers["authorization"];
  let userId = "";
  if (token) {
    userId = await getUserId(token);
  }
  return res.status(200).send({
    userId,
  });
}
