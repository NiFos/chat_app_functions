import { Request, Response } from "express";
import { getOauthUrl, oauth } from "./controllers/oauth";
import { passwordSignIn } from "./controllers/password";
import { refresh } from "./controllers/refresh";
import { registration } from "./controllers/registration";

export async function auth(req: Request, res: Response): Promise<Response> {
  const type = req.query.type;
  const { hasura_action_secret } = req.headers;
  const { action_secret } = process.env;
  if (hasura_action_secret !== action_secret && type !== "oauth")
    return res.status(401).send("");
  switch (type) {
    case "password":
      return passwordSignIn(req, res);
    case "register":
      return registration(req, res);
    case "get_oauth":
      return getOauthUrl(req, res);
    case "oauth":
      return oauth(req, res);
    case "refresh_token":
      return refresh(req, res);
    default:
      return res.status(500).send("");
  }
}
