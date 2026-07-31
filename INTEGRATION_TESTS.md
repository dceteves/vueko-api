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

1. **Database Connection**: Connects to the Neon PostgreSQL database before all tests run
2. **Test Data Cleanup**: Cleans up test data after each test using `afterEach` hooks
3. **Helper Functions**: Provides utility functions for creating test data

### Test Data Isolation

To ensure tests don't interfere with each other, the setup uses `afterEach` hooks to clean up data created during each test:

```typescript
afterEach(async () => {
  // Clean up test data created during tests
  // Delete in reverse dependency order
  await prisma.invitation.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
});
```

This approach:
- Deletes data in reverse dependency order (invitations → teams → users) to avoid foreign key constraint violations
- Runs after every test to ensure clean state
- Uses `deleteMany()` to efficiently remove all test data
- Works reliably with the single-fork configuration to avoid race conditions

### Helper Functions

The setup file exports several helper functions to make writing tests easier:

- `getTestClient()`: Returns the Prisma client instance
- `createTestUser(data)`: Creates a test user with optional custom data
- `createTestTeam(data)`: Creates a test team with optional custom data
- `createTestInvitation(data)`: Creates a test invitation with optional custom data
- `cleanupTestData()`: Manually cleans up all test data (useful in afterAll hooks)

## Running Integration Tests

Run integration tests with:

```bash
npm run test:integration
```

This command uses the integration-specific Vitest configuration.

## Writing Integration Tests

### Basic Structure

```typescript
import { describe, it, expect } from "vitest";
import prisma from "../../src/lib/prisma.ts";
import { createTestUser, createTestTeam } from "./setup";

describe("Feature Integration Tests", () => {
  describe("Specific Feature", () => {
    it("does something", async () => {
      // Create test data using helper functions
      const user = await createTestUser();
      const team = await createTestTeam({ captainId: user.id });

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

1. **Use Helper Functions**: Always use `createTestUser`, `createTestTeam`, etc. to create test data. These functions use unique identifiers to avoid conflicts.

2. **No beforeAll/afterAll Needed**: Since the setup file handles cleanup after each test, you typically don't need `beforeAll`/`afterAll` hooks. Each test starts with a clean database state.

3. **Test Isolation**: Rely on the `afterEach` cleanup in the setup file to clean up data created during tests. Don't manually clean up test data within individual tests unless necessary.

4. **Unique Identifiers**: When creating test data manually (not using helper functions), always use unique identifiers with timestamps or random strings to avoid conflicts:
   ```typescript
   osuUsername: `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
   ```

5. **Keep Tests Simple**: Each test should be self-contained and not depend on data from other tests. The afterEach cleanup ensures this.

## Database Schema Considerations

The integration tests work with the actual database schema. Be aware of:

- **Foreign Key Constraints**: The cleanup function deletes data in reverse dependency order (delete child records before parent records) to avoid constraint violations
- **Unique Constraints**: Helper functions use unique identifiers to avoid constraint violations
- **Database State**: The `afterEach` cleanup ensures tests start with a clean state by deleting all test data

## Troubleshooting

### Tests Fail with Foreign Key Constraint Violations

If you see errors like "Foreign key constraint violated", ensure you're:
1. Not manually deleting data in the wrong order
2. Using the helper functions which handle this automatically
3. Not leaving orphaned records in cleanup hooks

### Tests Fail with Unique Constraint Violations

If you see errors about duplicate keys, ensure you're:
1. Using unique identifiers for test data
2. Not creating the same data multiple times without cleanup
3. Using the helper functions which include unique identifiers

### Tests Fail Because Data is Missing

If tests fail because expected data is missing, ensure you're:
1. Creating data within the test (not relying on data from previous tests)
2. Not accidentally deleting data in cleanup hooks
3. Using the single-fork configuration to avoid race conditions

## Future Improvements

Potential improvements to the integration testing setup:

1. **Transaction Rollback**: Instead of deleting data after each test, use database transactions that are rolled back after each test. This would be faster and more reliable than manual cleanup.

2. **Test Database**: Use a separate test database instead of the main database to avoid any risk of affecting production data.

3. **Data Seeding**: Create a consistent set of seed data for tests that can be reset between test runs.

4. **Parallel Execution**: Configure tests to run in parallel with proper isolation (using transactions or separate databases per worker).
