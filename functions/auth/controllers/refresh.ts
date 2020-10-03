import { Request, Response } from "express";
import {
  isUserExist,
  updateRefreshToken,
  userHasRefreshToken,
} from "../utils/db";
import { genTokens, setRefreshToken } from "../utils/jwt";
export async function refresh(req: Request, res: Response): Promise<Response> {
  try {
    const token = req.cookies.__session;
    const userId = await userHasRefreshToken(req, token);

    if (userId === "") res.status(400).send("");
    const { accessToken, refreshToken } = await genTokens({ userId });
    const tokenInDb = await updateRefreshToken(req, userId, refreshToken);

    if (!tokenInDb) return res.status(400).send("");
    setRefreshToken(res, refreshToken);
    return res.status(200).send({
      accessToken,
    });
  } catch (error) {
    console.log(error);

    return res.status(400).send("");
  }
}
