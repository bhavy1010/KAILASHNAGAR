# Backend Tests

## Running

```
npm test              # run everything once
npm run test:watch    # re-run on file changes
npm run test:coverage # run with a coverage report
```

## Layout

```
tests/
  validators/    pure Zod schema tests — no DB, no mocking, fastest tier
  middlewares/   auth, rate limiting, request validation
  services/      classTeacher, notification — DB calls mocked
  controllers/   auth login flow, full leave lifecycle — DB calls mocked
```

## Why mocked models instead of a real database

The obvious "better" choice here is `mongodb-memory-server` — spins up a real
(temporary, in-RAM) MongoDB so tests exercise actual Mongoose behavior instead
of a stand-in. It's included as a devDependency for exactly that reason.

It wasn't used for this suite because the sandbox this was built in blocks
`fastdl.mongodb.org` (where the `mongod` binary is downloaded from), so it
couldn't actually be run or verified here. Every test in this suite mocks
the relevant Mongoose model with `jest.mock(...)` instead — a completely
standard pattern for controller/unit-level tests, just less thorough than
a real DB for catching schema-level surprises (e.g. an actual unique-index
violation).

**If your own machine has normal internet access**, `mongodb-memory-server`
should work fine there. A natural next step would be a smaller second tier
of true integration tests (e.g. one full "apply → approve → notify" leave
test against a real in-memory Mongo) layered on top of this suite — ask if
you'd like that added.

## What's covered

- All 13 Zod validator files (77 tests) — every required field, format
  rule, and cross-field check (date ranges, marks-can't-exceed-total, etc.)
- Rate limiting, JWT auth middleware, the generic `validate()` middleware
- `classTeacher.service` and `notification.service` in isolation
- `loginUser` across all 3 roles (admin/teacher/student), including
  wrong-password and account-not-found paths
- The full leave lifecycle: apply, list (scoped per role), approve/reject —
  including the class-teacher authorization rule (point 8): an admin can
  approve anything, a teacher can only approve leaves for students in a
  class they're formally assigned to

## What's NOT covered yet

Homework, exam, result, attendance, notice, and promotion controllers only
have their **validators** tested, not their controller logic — those were
deprioritized in favor of auth + leave (the two areas with the most
security-sensitive logic). Worth extending this same pattern to them next
if you want fuller coverage.