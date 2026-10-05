import assert from "node:assert/strict";
import test from "node:test";
import { jakartaCalendarDate } from "./jakarta-date.ts";

test("uses the Asia/Jakarta calendar date at the UTC boundary", () => {
  assert.equal(
    jakartaCalendarDate(new Date("2026-09-27T17:30:00Z"))
      .toISOString()
      .slice(0, 10),
    "2026-09-28",
  );
});

test("keeps a normal Asia/Jakarta daytime date", () => {
  assert.equal(
    jakartaCalendarDate(new Date("2026-09-27T09:00:00Z"))
      .toISOString()
      .slice(0, 10),
    "2026-09-27",
  );
});
