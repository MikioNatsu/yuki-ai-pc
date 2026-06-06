const request = require("supertest");
const { createDatabase } = require("../../src/db");
const { createApp } = require("../../src/server");

describe("/api/auth", () => {
  test("registers, logs in, and verifies JWT", async () => {
    const app = createApp({
      db: createDatabase(":memory:"),
      jwtSecret: "test-secret",
      clientOrigin: "http://localhost:5173"
    });

    const register = await request(app).post("/api/auth/register").send({
      email: "user@example.com",
      password: "password123",
      displayName: "User"
    });
    expect(register.status).toBe(201);
    expect(register.body.token).toBeTruthy();

    const login = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "password123"
    });
    expect(login.status).toBe(200);

    const verify = await request(app).get("/api/auth/verify").set("authorization", `Bearer ${login.body.token}`);
    expect(verify.status).toBe(200);
    expect(verify.body.user.email).toBe("user@example.com");
  });
});
