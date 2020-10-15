import { Request, Response } from "express";
import { isUserExist, regUser, insertRefreshToken } from "../utils/db";
import { genPayload, genTokens, setRefreshToken } from "../utils/jwt";
export async function registration(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = req.body.input.data;
    const userExist = await isUserExist(data, false, req.headers);
    if (userExist !== "")
      return res.status(200).send({
        accessToken: "",
      });
    const userId = await regUser(data, req.headers);
    if (userId === "")
      res.status(200).send({
        accessToken: "",
      });
    const payload = genPayload(userId);
    const { accessToken, refreshToken } = await genTokens(payload);
    const tokenInDb = await insertRefreshToken(req, userId, refreshToken);
    if (!tokenInDb)
      return res.status(200).send({
        accessToken: "",
      });
    setRefreshToken(res, refreshToken);
    return res.status(200).send({
      accessToken,
    });
  } catch (error) {
    return res.status(200).send({
      accessToken: "",
    });
  }
}
