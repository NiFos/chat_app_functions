import { Request, Response } from "express";
import { oauthGoogle } from "../utils/oauth_google";
import generator from "generate-password";
import { hashPassword } from "../utils/hash";
import { insertRefreshToken, isUserExist, regUser } from "../utils/db";
import { genTokens, setRefreshToken } from "../utils/jwt";

export async function getOauthUrl(
  req: Request,
  res: Response
): Promise<Response> {
  const url = oauthGoogle.getUrl();
  return res.status(200).send({
    url,
  });
}

const production_url = process.env.production_url || "";
export async function oauth(req: Request, res: Response): Promise<any> {
  const token = req.query.code;
  const user = await oauthGoogle.getUserInfo(token);

  const userExist = await isUserExist(
    { email: user.data.email },
    false,
    req.headers
  );
  console.log(userExist);

  let userId = userExist;
  if (userId === "") {
    const password = generator.generate({
      numbers: true,
      length: 10,
    });
    const hash = await hashPassword(password);
    const data = {
      email: user.data.email,
      password: hash,
      username: user.data.name,
    };
    userId = await regUser(data, req.headers);
    if (userId === "") res.redirect(production_url + `/auth?error=true`);
  }
  const { accessToken, refreshToken } = await genTokens({ userId });
  const tokenInDb = await insertRefreshToken(req, userId, refreshToken);
  if (!tokenInDb) return res.redirect(production_url + `/auth?error=true`);
  setRefreshToken(res, refreshToken);
  return res.redirect(production_url + `/auth?accessToken=${accessToken}`);
}
