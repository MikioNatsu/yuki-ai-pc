import { detectIntent, listSupportedIntents } from "../../src/services/intent_matcher.js";

describe("intent matcher", () => {
  test("detects open file intent", () => {
    expect(detectIntent("open file Documents/test.txt")).toMatchObject({
      type: "command",
      name: "open_file",
      args: { target: "Documents/test.txt" },
      requiresConfirmation: true
    });
  });

  test("lists all safe command intents", () => {
    expect(listSupportedIntents()).toEqual(
      expect.arrayContaining([
        "open_file",
        "start_app",
        "show_notification",
        "copy_to_clipboard",
        "create_note",
        "play_media",
        "pause_media"
      ])
    );
  });
});
