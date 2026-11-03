import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// @ts-expect-error -- plain .mjs script without type declarations
import { assignShards } from "../../scripts/e2e-shard.mjs";
// @ts-expect-error -- plain .mjs script without type declarations
import { parseShardTimings } from "../../scripts/e2e-shard-timings.mjs";

type Shard = { files: string[]; seconds: number };
const assign = assignShards as (
  files: string[],
  timings: Record<string, number>,
  total: number,
) => Shard[];
const parse = parseShardTimings as (log: string) => Record<string, number>;

describe("e2e shard split", () => {
  it("puts every file in exactly one shard", () => {
    const files = ["a.spec.ts", "b.spec.ts", "c.spec.ts", "d.spec.ts", "e.spec.ts"];
    const shards = assign(files, { "a.spec.ts": 10, "b.spec.ts": 50 }, 3);
    expect(shards.flatMap((shard) => shard.files).sort()).toEqual(files);
  });

  it("spreads slow files instead of keeping alphabetical runs together", () => {
    const timings = { "m1.spec.ts": 200, "m2.spec.ts": 200, "m3.spec.ts": 200, "z.spec.ts": 10 };
    const shards = assign(Object.keys(timings), timings, 3);
    expect(
      shards.map((shard) => shard.files.filter((file) => file.startsWith("m")).length),
    ).toEqual([1, 1, 1]);
  });

  it("is deterministic for ties, so every shard job computes the same split", () => {
    const files = ["b.spec.ts", "a.spec.ts", "c.spec.ts"];
    const timings = { "a.spec.ts": 5, "b.spec.ts": 5, "c.spec.ts": 5 };
    expect(assign(files, timings, 2)).toEqual(assign([...files].reverse(), timings, 2));
  });

  it("covers the committed timings evenly enough to matter", () => {
    const root = path.resolve(__dirname, "../..");
    const files = fs
      .readdirSync(path.join(root, "e2e"))
      .filter((name) => name.endsWith(".spec.ts"));
    const timings = JSON.parse(
      fs.readFileSync(path.join(root, "e2e", "shard-timings.json"), "utf8"),
    ) as Record<string, number>;
    const seconds = assign(files, timings, 3).map((shard) => shard.seconds);
    expect(Math.max(...seconds) / Math.min(...seconds)).toBeLessThan(1.1);
  });

  it("reads per-file seconds from CI log lines, retries included", () => {
    const log = [
      "e2e-windows (2)\tUNKNOWN STEP\t2026-11-03T01:07:05Z   ok  9 e2e\\a.spec.ts:1:1 › x (2.5s)",
      "e2e-windows (2)\tUNKNOWN STEP\t2026-11-03T01:07:40Z   ok 10 e2e\\a.spec.ts:9:1 › y (retry #1) (1.2m)",
      "e2e-windows (1)\tUNKNOWN STEP\t2026-11-03T01:07:40Z   x  11 e2e\\b.spec.ts:3:1 › z (400ms)",
      "validate\tTest\t2026-11-03T01:07:40Z   ok 12 e2e\\c.spec.ts:3:1 › z (9s)",
    ].join("\n");
    expect(parse(log)).toEqual({ "a.spec.ts": 75, "b.spec.ts": 1 });
  });
});
