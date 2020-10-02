import { hash, compare } from "bcrypt";

const salt = process.env.hash_salt || 10;
export function hashPassword(password: string): Promise<string> {
  return hash(password, salt);
}
