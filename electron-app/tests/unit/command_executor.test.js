import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { executeCommand, validateLocalPath } from "../../src/services/command_executor.js";

describe("command executor", () => {
  test("rejects network paths", () => {
    expect(() => validateLocalPath("\\\\server\\share\\file.txt")).toThrow("network_paths_disallowed");
  });

  test("opens only local files under home", () => {
    const filePath = path.join(os.homedir(), "vr-assistant-test-file.txt");
    fs.writeFileSync(filePath, "test", "utf8");
    try {
      expect(validateLocalPath(filePath)).toBe(filePath);
    } finally {
      fs.unlinkSync(filePath);
    }
  });

  test("requires whitelisted commands", async () => {
    await expect(executeCommand({ type: "command", name: "delete", args: {} }, { dryRun: true })).rejects.toThrow(
      "command_not_allowed"
    );
  });
});
