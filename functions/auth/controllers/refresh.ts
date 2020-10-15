import { Request, Response } from "express";
import { updateRefreshToken, userHasRefreshToken } from "../utils/db";
import { genPayload, genTokens, setRefreshToken } from "../utils/jwt";
export async function refresh(req: Request, res: Response): Promise<Response> {
  try {
    const token = req.cookies.__session;
    const userId = await userHasRefreshToken(req, token);

    if (userId === "")
      return res.status(200).send({
        accessToken: "",
      });
    const payload = genPayload(userId);
    const { accessToken, refreshToken } = await genTokens(payload);
    const tokenInDb = await updateRefreshToken(
      req,
      userId,
      token,
      refreshToken
    );

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
