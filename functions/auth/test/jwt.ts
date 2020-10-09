import "mocha";
import { expect } from "chai";
import { genPayload, genTokens } from "../utils/jwt";

const userId = "myuserid";

describe("JWT", () => {
  describe("Generate JWT", () => {
    it("With payload (should be without errors)", async () => {
      const payload = genPayload(userId);
      expect(payload).to.be.an("object");
      const { accessToken, refreshToken } = await genTokens(payload);
      expect(accessToken).to.be.a("string");
      expect(refreshToken).to.be.a("string");
    });
  });
});
