import fetch from "node-fetch";
import https from "https";
import { Request } from "express";
import { comparePassword, hashPassword } from "./hash";
import { getPayload } from "./jwt";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const url = process.env.hasura_url;
const admin_secret = process.env.admin_secret || "";
const execute = async (operation: string, variables: any, reqHeaders: any) => {
  const response = await fetch(new URL("/v1/graphql", url), {
    method: "POST",
    headers: { ...reqHeaders, "x-hasura-admin-secret": admin_secret } || {},
    body: JSON.stringify({
      query: operation,
      variables,
    }),
    agent: process.env.NODE_ENV === "production" ? httpsAgent : undefined,
  });
  return await response.json();
};

const hasura_password_operation = `
  query ($email: String!) {
    user_credentials(where: {email: {_eq: $email}}) {
      password
      user_id
    }
  }
`;

export async function isUserExist(
  userData: any,
  checkPassword: boolean,
  reqHeaders: object
): Promise<string> {
  try {
    const { email, password } = userData;
    const { data, errors } = await execute(
      hasura_password_operation,
      { email },
      reqHeaders
    );
    if (errors) {
      return "";
    }

    if (checkPassword) {
      const passwordsIsEqual = await comparePassword(
        password,
        data.user_credentials[0].password
      );
      return passwordsIsEqual ? data.user_credentials[0].user_id || "" : "";
    }

    return data.user_credentials[0].user_id || "";
  } catch (error) {
    return "";
  }
}

const hasura_insert_user_info_operation = `
  mutation ($username: String!) {
    insert_users_one(object: {username: $username}) {
      id
    }
  }
`;

const hasura_insert_user_credentials_operation = `
  mutation ($user_id: uuid!, $email: String!, $password: String!) {
    insert_user_credentials_one(object: {user_id: $user_id, email: $email, password: $password}) {
      user_id
    }
  }
`;

export async function regUser(data: any, reqHeaders: object): Promise<string> {
  try {
    const { username, email, password } = data;
    const hashedPassword = await hashPassword(password);
    const insertUserInfo = await execute(
      hasura_insert_user_info_operation,
      { username },
      reqHeaders
    );
    if (insertUserInfo.errors) {
      return "";
    }
    const insertUserCredentials = await execute(
      hasura_insert_user_credentials_operation,
      {
        user_id: insertUserInfo.data.insert_users_one.id,
        email,
        password: hashedPassword,
      },
      reqHeaders
    );
    if (insertUserCredentials.errors) {
      return "";
    }
    return insertUserCredentials.data.insert_user_credentials_one.user_id;
  } catch (error) {
    return "";
  }
}

const hasura_token_insert_operation = `
  mutation ($user_id: uuid!, $token: String!) {
    insert_tokens_one(object: {user_id: $user_id, token: $token}) {
      id
    }
  }
`;

export async function insertRefreshToken(
  req: Request,
  userId: string,
  token: string
): Promise<boolean> {
  try {
    const { data, errors } = await execute(
      hasura_token_insert_operation,
      { user_id: userId, token },
      req.headers
    );
    if (errors) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

const hasura_token_update_operation = `
  mutation ($user_id: uuid!, $token: String!, $newToken: String!) {
    update_tokens(where: {user_id: {_eq: $user_id}, token: {_eq: $token}}, _set: {token: $newToken}) {
      returning {
        user_id
      }
    }
  }
`;

export async function updateRefreshToken(
  req: Request,
  userId: string,
  token: string,
  newToken: string
): Promise<boolean> {
  try {
    const { data, errors } = await execute(
      hasura_token_update_operation,
      { user_id: userId, token, newToken },
      req.headers
    );
    if (errors) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

const hasura_token_get_operation = `
  query ($token: String!) {
    tokens(where: {token: {_eq: $token}}) {
      user {
        user_id
        email
        password
      }
    }
  }
`;

export async function userHasRefreshToken(
  req: Request,
  token: string
): Promise<string> {
  try {
    const { data, errors } = await execute(
      hasura_token_get_operation,
      { token },
      req.headers
    );

    if (errors) {
      return "";
    }
    if (data.tokens.length <= 0) return "";
    const payload = await getPayload(token);
    if (JSON.stringify(payload) === JSON.stringify({})) {
      return "";
    }

    return payload["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  } catch (error) {
    console.log(error);

    return "";
  }
}
