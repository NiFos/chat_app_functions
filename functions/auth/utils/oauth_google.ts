import { google } from "googleapis";

const google_client_id = process.env.google_client_id || "";
const google_client_secret = process.env.google_client_secret || "";
const google_redirect_url = process.env.google_redirect_url || "";

const createConnectionGoogle = () =>
  new google.auth.OAuth2(
    google_client_id,
    google_client_secret,
    google_redirect_url
  );
const oauth2 = google.oauth2("v2");

export const oauthGoogle = {
  getUrl() {
    const scope = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];
    const auth = createConnectionGoogle();
    const url = auth.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope,
    });

    return url;
  },

  async getUserInfo(token: any): Promise<any> {
    const auth = createConnectionGoogle();
    const data = await auth.getToken(token);

    auth.setCredentials(data.tokens);
    return await oauth2.userinfo.get({ auth });
  },
};
