import fs from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";

import { describe, expect, it, vi } from "vitest";

interface OverlayI18nApi {
  load: (fetchMessages: () => Promise<unknown>) => Promise<boolean>;
  apply: (next: unknown) => boolean;
  t: (key: string) => string;
}

function loadRendererHelper() {
  const node = {
    textContent: "English default",
    title: "English title",
    getAttribute: (name: string) => (name === "data-i18n" ? "test.label" : "test.title"),
  };
  const document = {
    documentElement: { lang: "en" },
    querySelectorAll: (selector: string) =>
      selector === "[data-i18n]" || selector === "[data-i18n-title]" ? [node] : [],
  };
  const window = {} as { overlayI18n?: OverlayI18nApi };
  const source = fs.readFileSync(path.resolve(__dirname, "../../renderer/overlay-i18n.js"), "utf8");

  runInNewContext(source, { document, Promise, Set, String, setTimeout, clearTimeout, window });
  return { api: window.overlayI18n!, document, node };
}

describe("overlay renderer messages", () => {
  // Callers gate their first paint on this resolving true, so a false here is
  // an overlay that never opens.
  it("still lets the overlay open when loading messages fails", async () => {
    const { api, node } = loadRendererHelper();

    await expect(api.load(() => Promise.reject(new Error("unavailable")))).resolves.toBe(true);
    expect(node.textContent).toBe("English default");
    expect(node.title).toBe("English title");
  });

  it("still lets the overlay open when the pull never answers", async () => {
    vi.useFakeTimers();
    try {
      const { api } = loadRendererHelper();
      const loaded = api.load(() => new Promise(() => {}));
      await vi.advanceTimersByTimeAsync(5000);
      await expect(loaded).resolves.toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not let a slow pull overwrite a push that already landed", async () => {
    const { api, node } = loadRendererHelper();
    let release: (value: unknown) => void = () => {};
    const slow = new Promise((resolve) => (release = resolve));

    const loaded = api.load(() => slow);
    api.apply({ locale: "en", messages: { "test.label": "Pushed", "test.title": "Pushed title" } });
    expect(node.textContent).toBe("Pushed");

    release({ locale: "en", messages: { "test.label": "Pulled", "test.title": "Pulled title" } });
    await loaded;
    expect(node.textContent).toBe("Pushed");
  });

  it("applies a message bundle and its locale", async () => {
    const { api, document, node } = loadRendererHelper();

    await expect(
      api.load(() =>
        Promise.resolve({
          locale: "en",
          messages: { "test.label": "Loaded label", "test.title": "Loaded title" },
        }),
      ),
    ).resolves.toBe(true);
    expect(node.textContent).toBe("Loaded label");
    expect(node.title).toBe("Loaded title");
    expect(document.documentElement.lang).toBe("en");
    expect(api.t("test.label")).toBe("Loaded label");
  });
});
