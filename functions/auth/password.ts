import { Request, Response } from "express";
import { insertRefreshToken, isUserExist } from "./db";
import { genTokens, setRefreshToken } from "./jwt";
export async function passwordSignIn(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = await isUserExist(req);
    if (userId === "") return res.status(400).send("");
    const { accessToken, refreshToken } = await genTokens({ userId });
    const tokenInDb = insertRefreshToken(req, userId, refreshToken);
    if (!tokenInDb) return res.status(400).send("");
    setRefreshToken(res, refreshToken);
    return res.status(200).send({
      accessToken,
    });
  } catch (error) {
    return res.status(400).send("");
  }
}
