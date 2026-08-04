import { beforeEach } from "vitest";
import resetDb from "./reset-db-helper.ts";

beforeEach(async () => {
  await resetDb();
});
