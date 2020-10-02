import jwt from "jsonwebtoken";
import { Response } from "express";

const secret = process.env.jwt_secret || "123456";

interface Itokens {
  accessToken: string;
  refreshToken: string;
}
export async function genTokens(payload: any): Promise<Itokens> {
  const accessToken = jwt.sign(payload, secret, {});
  const refreshToken = jwt.sign(payload, secret, {});
  return {
    accessToken,
    refreshToken,
  };
}

export function setRefreshToken(res: Response, refreshToken: string): void {
  res.set(
    "Access-Control-Allow-Origin",
    "https://hot-ferret-22.hasura.app/v1/"
  );
  res.set("Access-Control-Allow-Credentials", "true");
  res.cookie("__session", refreshToken);
}
