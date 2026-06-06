const nock = require("nock");
const request = require("supertest");
const { createDatabase } = require("../../src/db");
const { createApp } = require("../../src/server");

function appWithConfig(config = {}) {
  const db = createDatabase(":memory:");
  return createApp({
    db,
    jwtSecret: "test-secret",
    tokenLimit: 1000,
    defaultModel: "test/model",
    clientOrigin: "http://localhost:5173",
    ...config
  });
}

async function authToken(app) {
  const response = await request(app).post("/api/auth/register").send({
    email: "test@example.com",
    password: "password123",
    displayName: "Tester"
  });
  return response.body.token;
}

describe("/api/ai/chat", () => {
  afterEach(() => nock.cleanAll());

  test("returns mock JSON when OpenRouter key is not configured", async () => {
    const app = appWithConfig({ openRouterApiKey: "" });
    const token = await authToken(app);

    const response = await request(app)
      .post("/api/ai/chat")
      .set("authorization", `Bearer ${token}`)
      .send({ message: "salom" })
      .expect(200);

    expect(response.body.reply).toContain("Mock javob");
    expect(response.body).not.toHaveProperty("openRouterApiKey");
  });

  test("parses OpenRouter JSON and sanitizes unsafe actions", async () => {
    const app = appWithConfig({ openRouterApiKey: "test-key" });
    const token = await authToken(app);

    nock("https://openrouter.ai")
      .post("/api/v1/chat/completions")
      .reply(200, {
        choices: [
          {
            message: {
              content: JSON.stringify({
                reply: "OK",
                speech: { voice_hint: "", rate: 1, pitch: 1, phoneme_timestamps: [] },
                emotion: { label: "joy", intensity: 0.7 },
                actions: [
                  { type: "command", name: "open_file", args: { target: "Documents/test.txt" }, confidence: 0.9 },
                  { type: "command", name: "open_file", args: { target: "\\\\server\\share" }, confidence: 0.9 },
                  { type: "command", name: "delete", args: { target: "C:\\" }, confidence: 1 }
                ],
                memory_add: ["pref=uz"],
                meta: { language: "uz", response_tokens_estimate: 12 }
              })
            }
          }
        ]
      });

    const response = await request(app)
      .post("/api/ai/chat")
      .set("authorization", `Bearer ${token}`)
      .send({ message: "open Documents/test.txt" })
      .expect(200);

    expect(response.body.reply).toBe("OK");
    expect(response.body.actions).toHaveLength(2);
    expect(response.body.actions[0].args.target).toBe("Documents/test.txt");
    expect(response.body.actions[1].args).toEqual({});
  });
});
