import { Request, Response } from "express";
import { isUserExist, regUser, insertRefreshToken } from "./db";
import { genTokens, setRefreshToken } from "./jwt";
export async function registration(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userExist = await isUserExist(req);
    if (userExist !== "") return res.status(400).send("");
    const userId = await regUser(req);
    const { accessToken, refreshToken } = await genTokens({ userId });
    const tokenInDb = insertRefreshToken(req, userId, refreshToken);
    if (!tokenInDb) return res.status(400).send("");
    setRefreshToken(res, refreshToken);
    return res.status(200).send({
      accessToken,
    });
    return res.status(200).send({});
  } catch (error) {
    return res.status(400).send("");
  }
}
