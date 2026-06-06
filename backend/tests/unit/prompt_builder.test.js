const { buildPrompt } = require("../../src/services/prompt_builder");

describe("buildPrompt", () => {
  test("includes compact profile, facts, messages, and user message", () => {
    const prompt = buildPrompt({
      userProfile: { charName: "Yuki", persona: "One-line persona" },
      keyFacts: ["name=Alone", "lang=uz"],
      recentMessages: [{ role: "user", content: "salom" }],
      userMessage: "faylni och",
      tokenLimit: 300
    });

    expect(prompt).toContain("CHAR_NAME=Yuki");
    expect(prompt).toContain("PERSONA=One-line persona");
    expect(prompt).toContain("name=Alone; lang=uz");
    expect(prompt).toContain("user: salom");
    expect(prompt).toContain("USER_MESSAGE=faylni och");
  });
});
