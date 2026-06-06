import { detectIntent } from "../../src/services/intent_matcher.js";

describe("Electron E2E scaffold", () => {
  test("login to local chat to offline intent detection flow can be mocked", () => {
    const token = "mock-jwt";
    const localMessages = [];
    localMessages.push({ role: "user", content: "open file Documents/test.txt" });
    const intent = detectIntent(localMessages[0].content);

    expect(token).toBeTruthy();
    expect(localMessages).toHaveLength(1);
    expect(intent).toMatchObject({ name: "open_file", requiresConfirmation: true });
  });
});
