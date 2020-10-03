import jwt from "jsonwebtoken";
import { Response } from "express";

const secret = process.env.jwt_secret || "123456";
const accessExpiration = process.env.jwt_access_expiration || "1h";
const refreshExpiration = process.env.jwt_refresh_expiration || "1y";

interface Itokens {
  accessToken: string;
  refreshToken: string;
}
export async function genTokens(payload: object): Promise<Itokens> {
  const accessToken = jwt.sign({ ...payload }, secret, {
    expiresIn: accessExpiration,
  });
  const refreshToken = jwt.sign({ ...payload }, secret, {
    expiresIn: refreshExpiration,
  });
  return {
    accessToken,
    refreshToken,
  };
}

export async function getPayload(token: string): Promise<any> {
  const decoded = jwt.verify(token, secret);
  return decoded;
}

const hasura_url = process.env.hasura_url || "";
export function setRefreshToken(res: Response, refreshToken: string): void {
  res.set("Access-Control-Allow-Origin", hasura_url);
  res.set("Access-Control-Allow-Credentials", "true");
  res.cookie("__session", refreshToken);
}
