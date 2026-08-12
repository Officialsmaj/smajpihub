import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/pages/jobs/JobsPage.tsx", import.meta.url), "utf8");
const api = readFileSync(new URL("../src/lib/jobsApi.ts", import.meta.url), "utf8");
const header = readFileSync(new URL("../src/pages/jobs/JobsHeader.tsx", import.meta.url), "utf8");
const preferences = readFileSync(new URL("../src/pages/jobs/JobPreferencesPanel.tsx", import.meta.url), "utf8");

assert.match(page, /Loading live opportunities/);
assert.match(page, /limited offline catalog/);
assert.match(page, /URLSearchParams/);
assert.match(api, /location\?: string/);

assert.match(page, /saveJobsProfile/);
assert.doesNotMatch(page, /localStorage\.setItem\("smaj_jobs_profile"/);
assert.match(page, /updateEmployerApplication/);
assert.match(page, /Submit company for review/);
assert.match(header, /pointerdown/);
assert.match(header, /event\.key === "Escape"/);
assert.match(header, /jobs-menu-backdrop/);
assert.match(header, /setMenuOpen\(value => !value\)/);
assert.match(header, /Job seeker profile/);
assert.match(header, /Employer dashboard/);
assert.match(header, /Employer: post a job/);
assert.match(page, /SMAJ PI HUB/);
assert.match(page, /Add another company/);
assert.match(page, /newCompanyName/);
assert.match(page, /no separate Jobs login is needed/);
assert.doesNotMatch(page, /Sign in with your Pi account/);
assert.match(preferences, /How do you want to use SMAJ PI Jobs/);
assert.match(preferences, /Edit pay preference/);
assert.match(preferences, /Edit location preferences/);
assert.match(preferences, /Job title and work-area preferences/);
console.log("Jobs UI tests passed.");
