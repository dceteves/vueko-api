# Integration Tests

This document describes the integration testing setup for the Vueko project.

## Overview

Integration tests are located in `test/integration/` and use the actual Neon PostgreSQL database to test database operations and API endpoints.

## Setup

### Configuration

Integration tests use a separate Vitest configuration file: `vitest.integration.config.ts`. This configuration:

- Uses the Node environment
- Includes the global setup file at `test/integration/setup.ts`
- Only runs tests matching `test/integration/**/*.test.ts`
- Uses a single fork (`singleFork: true`) to ensure tests run sequentially and avoid database conflicts

### Global Setup

The `test/integration/setup.ts` file handles:

1. **Database Reset**: Resets the database before each test using `beforeEach` hooks
2. **Simplified Cleanup**: Uses a transaction-based reset helper for consistent data cleanup

### Test Data Isolation

To ensure tests don't interfere with each other, the setup uses a simplified `beforeEach` hook with a transaction-based reset:

**Setup File** (`test/integration/setup.ts`):
```typescript
import { beforeEach } from "vitest";
import resetDb from "./reset-db-helper.ts";

beforeEach(async () => {
  await resetDb();
});
```

**Reset Helper** (`test/integration/reset-db-helper.ts`):
```typescript
import prisma from "../../src/lib/prisma";

export default async () => {
  await prisma.$transaction([
    prisma.invitation.deleteMany(),
    prisma.team.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};
```

This approach:
- Uses **database transactions** to ensure atomic cleanup operations
- Runs **before each test** to ensure a clean starting state
- Deletes data in **correct dependency order** (invitations → teams → users) within a single transaction
- **Eliminates foreign key constraint issues** by using transactional isolation
- **Simpler and more reliable** than retry-based approaches
- Works consistently with the `--no-file-parallelism` flag to avoid race conditions

### Helper Functions

The new simplified setup no longer exports helper functions. Tests should use Prisma client directly:

```typescript
import prisma from "../../src/lib/prisma.ts";

// Create test data directly
const user = await prisma.user.create({
  data: { osuUsername: "test_user" },
});

const team = await prisma.team.create({
  data: {
    captainId: user.id,
    name: "Test Team",
  },
});
```

**Note**: Tests should use unique identifiers (timestamps, random strings) to avoid constraint violations, as the automatic cleanup happens before each test.

## Running Integration Tests

Run integration tests with:

```bash
npm run test:integration
```

This command uses the integration-specific Vitest configuration with the `--no-file-parallelism` flag to ensure tests run sequentially and avoid database conflicts.

## Writing Integration Tests

### Basic Structure

```typescript
import { describe, it, expect } from "vitest";
import prisma from "../../src/lib/prisma.ts";

describe("Feature Integration Tests", () => {
  describe("Specific Feature", () => {
    it("does something", async () => {
      // Create test data directly using Prisma
      const user = await prisma.user.create({
        data: { osuUsername: `test_user_${Date.now()}` },
      });
      
      const team = await prisma.team.create({
        data: {
          captainId: user.id,
          name: `Test Team ${Date.now()}`,
        },
      });

      // Test behavior
      const result = await prisma.team.findUnique({
        where: { id: team.id },
      });

      expect(result).not.toBeNull();
    });
  });
});
```

### Best Practices

1. **Use Unique Identifiers**: Always use unique identifiers with timestamps or random strings to avoid constraint violations:
   ```typescript
   osuUsername: `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
   ```

2. **No Manual Cleanup Needed**: The `beforeEach` hook automatically cleans up all test data before each test runs, so you don't need to manually clean up within tests.

3. **Test Isolation**: Each test starts with a completely clean database state. Don't depend on data from previous tests.

4. **Direct Prisma Usage**: Use Prisma client directly for all database operations. The transaction-based reset handles all cleanup automatically.

5. **Keep Tests Simple**: Each test should be self-contained and create all the data it needs.

## Database Schema Considerations

The integration tests work with the actual database schema. Be aware of:

- **Foreign Key Constraints**: The transaction-based reset handles these automatically by deleting in the correct order
- **Unique Constraints**: Use unique identifiers in your test data to avoid constraint violations
- **Database State**: The `beforeEach` transaction ensures tests start with a clean state

## Troubleshooting

### Tests Fail with Foreign Key Constraint Violations

This should not happen with the new transaction-based approach. If you see these errors:
1. Ensure you're not manually creating data with conflicting foreign keys
2. Check that the reset helper is being called before each test
3. Verify the database migrations are up to date

### Tests Fail with Unique Constraint Violations

If you see errors about duplicate keys, ensure you're:
1. Using unique identifiers for test data (timestamps, random strings)
2. Not reusing the same test data across multiple tests
3. Letting the `beforeEach` cleanup handle data reset

### Tests Fail Because Data is Missing

If tests fail because expected data is missing, ensure you're:
1. Creating all necessary data within each test
2. Not depending on data from previous tests
3. Using the correct field names and relationships

## Future Improvements

The current implementation already addresses several key improvements:

✅ **Transaction-based cleanup**: Implemented using Prisma transactions for atomic and reliable data cleanup

**Potential additional improvements**:

1. **Test Database**: Use a separate test database instead of the main database to avoid any risk of affecting production data
2. **Data Seeding**: Create a consistent set of seed data for tests that can be reset between test runs
3. **Parallel Execution**: Configure tests to run in parallel with proper isolation (using separate databases per worker)
