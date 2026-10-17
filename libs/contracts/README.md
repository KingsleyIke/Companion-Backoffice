# contracts

Generated from the API. **Do not edit by hand** — run `pnpm generate:client`.

- `openapi.json` — the API contract, produced from the NestJS decorators by `pnpm generate:spec`.
  The mobile repo generates its Dart client from this file.
- `src/generated/` — the Angular client (`ng-openapi-gen`), imported as `@companion/contracts`.

CI regenerates both and fails if they differ from what is committed.
