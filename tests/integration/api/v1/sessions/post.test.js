import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import session from "models/session.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("with incorrect `email` and correct `password`", async () => {
      await orchestrator.createUser({
        password: "senhaCorreta",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect@example.com",
          password: "senhaCorreta",
        }),
      });

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
        status_code: 401,
      });
      expect(response.status).toBe(401);
    });
    test("with correct `email` and correct `password`", async () => {
      await orchestrator.createUser({
        email: "correct@example.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct@example.com",
          password: "senhaIncorreta",
        }),
      });

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
        status_code: 401,
      });
      expect(response.status).toBe(401);
    });
    test("with incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect@example.com",
          password: "incorrectPassword",
        }),
      });

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
        status_code: 401,
      });
      expect(response.status).toBe(401);
    });
    test("with correct `email` and correct `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "correctLogin@example.com",
        password: "correctPassword",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correctLogin@example.com",
          password: "correctPassword",
        }),
      });

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        userId: createdUser.id,
        expiresAt: responseBody.expiresAt,
        createdAt: responseBody.createdAt,
        updatedAt: responseBody.updatedAt,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expiresAt)).not.toBeNaN();
      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expiresAt);
      const createdAt = new Date(responseBody.createdAt);
      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);
      expect(response.status).toBe(201);

      const parsedSetCookie = setCookieParser.parse(response, { map: true });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        httpOnly: true,
        path: "/",
      });
    });
  });
});
