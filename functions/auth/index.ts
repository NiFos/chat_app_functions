import { Request, Response } from "express";
import { passwordSignIn } from "./password";
import { registration } from "./registration";

export async function auth(req: Request, res: Response): Promise<Response> {
  const type = req.query.type;
  const { hasura_action_secret } = req.headers;
  const { action_secret } = process.env;
  if (hasura_action_secret !== action_secret) return res.status(401).send("");
  switch (type) {
    case "password":
      return passwordSignIn(req, res);
    case "register":
      return registration(req, res);
    case "oauth":
      return res.status(400).send("");
    case "refresh_token":
      return res.status(400).send("");
    default:
      return res.status(500).send("");
  }
}
