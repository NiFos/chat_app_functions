import { Request, Response } from "express";
import { insertRefreshToken, isUserExist } from "../utils/db";
import { genPayload, genTokens, setRefreshToken } from "../utils/jwt";
export async function passwordSignIn(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = req.body.input.data;
    const userId = await isUserExist(data, true, req.headers);
    if (userId === "") return res.status(400).send("");
    const payload = genPayload(userId);
    const { accessToken, refreshToken } = await genTokens(payload);
    const tokenInDb = await insertRefreshToken(req, userId, refreshToken);
    if (!tokenInDb) return res.status(400).send("");
    setRefreshToken(res, refreshToken);
    return res.status(200).send({
      accessToken,
    });
  } catch (error) {
    return res.status(400).send("");
  }
}
