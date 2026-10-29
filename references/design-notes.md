# Design notes: letting an agent spend money

For developers. The skill is small on purpose (a workflow file and a client of about six hundred lines); the interesting part is the contract it relies on, which applies to any agent that spends money on a user's behalf.

## 1. Quote, cap, confirm

A paid request must carry `maxCredits`, the most the user agreed to. The server quotes, compares, signs and starts the job in one request, re-quoting inside the same transaction: if the price is above the cap it answers `QUOTE_EXCEEDS_BUDGET` with the real number and charges nothing; if the inputs or prices changed since the agent looked, `QUOTE_CHANGED`. There is no window between what the user saw and what is charged. `dryRun: true` returns the same numbers without starting anything, which is what the agent shows the user before asking.

## 2. Money needs idempotency

Every paid request can carry an `idempotencyKey` (body or `Idempotency-Key` header). The same key replays the same job, so a retry after a timeout cannot charge twice; the same key with a different request is refused (`IDEMPOTENCY_CONFLICT`). The CLI accepts yours with `--idempotency-key`; the rule in SKILL.md is one key per logical action, a fresh one after a failure.

## 3. Review before you pay

The cheap step runs first: the script is written and stops in `review`. Editing the scenes is free, and the expensive step runs on the text the user approved. `estimate` tells the agent, before any quote, whether a small trim changes the price.

## 4. Refunds are a contract, not a ticket

A job that fails returns its credits by itself (`refundedCredits` on the job), and a cancel before paid work started refunds too. So the agent's rule is simple: report the error, do not loop retries, retry once if the user wants.

## 5. A CLI an agent can trust

One JSON document on stdout, progress on stderr, exit codes 0, 1 and 2, `--wait` polls to a terminal state, a 429 is retried once after `Retry-After`, the key is read from the environment and never printed or written, no dependencies (Node 18+), and an `X-GoMotion-Client` header so usage can be attributed to the skill and the agent.

## 6. Pictures keep their papers

Every picture in a video records its source, author and license. The API returns them (`GET /jobs/:id/attribution`), and `download` writes them to `CREDITS.txt` next to the MP4, the pictures that need a credit line first, so the agent can quote them without opening the studio.

See [references/api.md](api.md) for the endpoints and error codes.
