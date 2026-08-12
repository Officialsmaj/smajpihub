import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/pages/jobs/JobsPage.tsx", import.meta.url), "utf8");
const api = readFileSync(new URL("../src/lib/jobsApi.ts", import.meta.url), "utf8");

assert.match(page, /Loading live opportunities/);
assert.match(page, /limited offline catalog/);
assert.match(page, /URLSearchParams/);
assert.match(api, /location\?: string/);

assert.match(page, /saveJobsProfile/);
assert.doesNotMatch(page, /localStorage\.setItem\("smaj_jobs_profile"/);
assert.match(page, /updateEmployerApplication/);
assert.match(page, /Submit company for review/);
console.log("Jobs UI tests passed.");
