# lucid-fee-issue

Minimal reproduction project for a [lucid-evolution](https://github.com/Anastasia-Labs/lucid-evolution) fee issue.

## Setup

```bash
nvm use
pnpm install
```

## Run tests

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

## Project structure

- `tests/fee-issue.test.ts` — test scaffold with a Lucid emulator environment
- `tests/test-helpers.ts` — shared test context types
- `tests/protocol-parameters.ts` — protocol parameters for the emulator

The test initializes a Lucid emulator with a funded admin wallet. Add your reproduction logic in `tests/fee-issue.test.ts`.
# lucid-fee-issue
