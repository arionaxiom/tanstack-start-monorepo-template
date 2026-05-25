# Task Brief

## Task Type

`implementation-pr`

Allowed values:

- `investigation-only`
- `implementation-local`
- `implementation-pr`
- `review`
- `fix-existing-pr`

## Title

<short task title>

## Goal

<what should be accomplished>

## Worktree Context

- Branch: `<branch>`
- Worktree: `<absolute path>`

## Required Reading

- `AGENTS.md`
- `WORKFLOW.md`
- `<spec / rules / architecture docs as needed>`

## Scope

- <in-scope item>
- <in-scope item>

## Out Of Scope

- <explicit non-goal>
- <explicit non-goal>

## Constraints

- <preserve semantics / no migration / no API contract change / etc.>
- <other constraints>

## QA Expectation

- Required / Optional / Not applicable
- Reason: <why>

## Completion Contract

- [ ] Implement the requested change
- [ ] Add or update focused tests
- [ ] Run `pnpm lint`
- [ ] Run `pnpm check-types`
- [ ] Run the required test command(s)
- [ ] If the root gate (`pnpm lint`, `pnpm check-types`, `pnpm test`) passed before commit/push, do not rerun it solely because `pre-commit` or `pre-push` changed staged files
- [ ] Run required live QA if applicable
- [ ] Commit and push if task type requires it
- [ ] Open/update a ready-for-review PR if task type requires it
- [ ] Do not create a draft PR unless this brief explicitly says to
- [ ] Send final AoE completion message to `Orchestrator`

## Reporting Back

When done, report:

- summary of what changed
- validation commands run and results
- whether live QA was required or skipped
- PR number/link if applicable
- any follow-up work that should be split into another PR

## Completion Message Format

Final orchestrator notification should use the canonical contract format:

`Done: <task-title> | task-type=<task-type> | status=<done|blocked> | pr=<pr-link-or-n/a> | verify=<summary> | qa=<done|skipped|not-required>`
