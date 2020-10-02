import fetch from "node-fetch";
import { Request } from "express";
import { hashPassword } from "./hash";

const url = process.env.hasura_url || "";
const execute = async (operation: string, variables: any, reqHeaders: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: reqHeaders || {},
    body: JSON.stringify({
      query: operation,
      variables,
    }),
  });
  return await response.json();
};

const hasura_password_operation = `
  query ($email: String!, $password: String!) {
    user_credentials(where: {email: {_eq: $email}, password: {_eq: $password}}) {
      user_id
    }
  }
`;

export async function isUserExist(req: Request): Promise<string> {
  const { email, password } = req.body.input.data;
  const hashedPassword = await hashPassword(password);
  const { data, errors } = await execute(
    hasura_password_operation,
    { email, password: hashedPassword },
    req.headers
  );
  if (errors) {
    return "";
  }
  return data.user_credentials.user_id;
}

const hasura_insert_user_info_operation = `
  mutation ($username: String!) {
    insert_users_one(object: {username: $username}) {
      id
    }
  }
`;

const hasura_insert_user_credentials_operation = `
  mutation ($user_id: String!, email: String!, password: String!) {
    insert_user_credentials_one(object: {user_id: $user_id, email: $email, password: $password}) {
      user_id
    }
  }
`;

export async function regUser(req: Request): Promise<string> {
  try {
    const { username, email, password } = req.body.input.data;
    const hashedPassword = await hashPassword(password);
    const insertUserInfo = await execute(
      hasura_insert_user_info_operation,
      { username },
      req.headers
    );
    if (insertUserInfo.errors) {
      return "";
    }
    const insertUserCredentials = await execute(
      hasura_insert_user_credentials_operation,
      {
        user_id: insertUserInfo.insert_users_one.id,
        email,
        password: hashedPassword,
      },
      req.headers
    );
    if (insertUserInfo.errors) {
      return "";
    }
    return insertUserCredentials.insert_user_credentials_one.id;
  } catch (error) {
    return "";
  }
}

const hasura_token_insert_operation = `
  mutation ($user_id: String!, token: String!) {
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
  const { data, errors } = await execute(
    hasura_token_insert_operation,
    { user_id: userId, token },
    req.headers
  );
  if (errors) {
    return false;
  }
  return true;
}

const hasura_token_update_operation = `
  mutation ($user_id: String!, token: String!) {
    update_tokens(where: {user_id: {_eq: $user_id}, token: {_eq: $token}}) {
      returning {
        user_id
      }
    }
  }
`;

export async function updateRefreshToken(
  req: Request,
  userId: string,
  token: string
): Promise<boolean> {
  const { data, errors } = await execute(
    hasura_token_update_operation,
    { user_id: userId, token },
    req.headers
  );
  if (errors) {
    return false;
  }
  return true;
}
