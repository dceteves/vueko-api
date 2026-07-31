# Testing Strategy Guide

## Layer-by-Layer Testing Approach

### 1. Repository Layer Tests
**Purpose**: Test data access logic and Prisma interactions
**Mock**: Prisma Client
**Location**: `test/unit/repositories/`

```typescript
import { mockDeep } from "vitest-mock-extended";
import { UserRepository } from "../../src/repositories/user-repository";

describe("UserRepository", () => {
  it("finds user by id", async () => {
    const prismaMock = mockDeep<PrismaClient>();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    
    const repo = new UserRepository(prismaMock);
    const result = await repo.findUnique({ where: { id: "1" } });
    
    expect(result).toEqual(mockUser);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "1" }
    });
  });
});
```

**What to test**:
- CRUD operations work correctly
- Error handling for Prisma errors
- Query building logic
- Transaction usage

### 2. Service Layer Tests
**Purpose**: Test business logic and orchestration
**Mock**: Repository instances
**Location**: `test/unit/services/`

```typescript
import { mockDeep } from "vitest-mock-extended";
import UserService, { setUserRepository } from "../../src/services/user";
import { UserRepository } from "../../src/repositories/user-repository";

describe("UserService", () => {
  let userRepoMock: ReturnType<typeof mockDeep<UserRepository>>;

  beforeEach(() => {
    userRepoMock = mockDeep<UserRepository>();
    setUserRepository(userRepoMock);
  });

  it("finds user by id", async () => {
    userRepoMock.findUnique.mockResolvedValue(mockUser);
    
    const result = await UserService.findUser("1");
    
    expect(result).toEqual(mockUser);
    expect(userRepoMock.findUnique).toHaveBeenCalledWith({
      where: { id: "1" }
    });
  });
});
```

**What to test**:
- Business rules and validation
- Error handling and edge cases
- Data transformation
- Orchestration of multiple repository calls
- Transaction management via TransactionManager

### 3. Handler Layer Tests
**Purpose**: Test HTTP request/response handling
**Mock**: Service instances, Express req/res
**Location**: `test/unit/handlers/`

```typescript
import { mockDeep } from "vitest-mock-extended";
import UserHandler from "../../src/handlers/service/user";
import UserService from "../../src/services/user";

describe("UserHandler", () => {
  let userServiceMock: ReturnType<typeof mockDeep<UserService>>;

  beforeEach(() => {
    userServiceMock = mockDeep<UserService>();
    UserHandler.userService = userServiceMock;
  });

  it("returns user data", async () => {
    const mockReq = { params: { id: "1" } };
    const mockRes = { json: vi.fn() };
    
    userServiceMock.findUser.mockResolvedValue(mockUser);
    
    await UserHandler.getUser(mockReq, mockRes);
    
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });
});
```

**What to test**:
- Request parsing and validation
- Response formatting
- HTTP status codes
- Error handling and error responses
- Middleware integration

### 4. Middleware Tests
**Purpose**: Test request processing pipeline
**Mock**: Next functions, req/res objects
**Location**: `test/unit/middleware/`

```typescript
import { Request, Response, NextFunction } from "express";
import AuthMiddleware from "../../src/middleware/auth";

describe("AuthMiddleware", () => {
  it("allows authenticated requests", async () => {
    const mockReq = { session: { userId: "1" } };
    const mockRes = {};
    const mockNext = vi.fn();
    
    await AuthMiddleware.ensureAuth(mockReq, mockRes, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
  });
});
```

**What to test**:
- Authentication/authorization logic
- Request modification
- Response interception
- Error propagation

### 5. Integration Tests
**Purpose**: Test end-to-end functionality
**Mock**: External services only (OAuth providers, etc.)
**Location**: `test/integration/`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";

describe("User API Integration", () => {
  it("creates and retrieves user", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ name: "test" })
      .expect(201);
    
    expect(response.body).toHaveProperty("id");
    
    const getResponse = await request(app)
      .get(`/api/users/${response.body.id}`)
      .expect(200);
    
    expect(getResponse.body.name).toBe("test");
  });
});
```

**What to test**:
- Full request/response cycles
- Database interactions
- Multiple service coordination
- Real HTTP responses

## Dependency Injection Pattern

To enable proper layer isolation, use dependency injection:

### Service Pattern
```typescript
// src/services/user.ts
let userRepo = new UserRepository();

export function setUserRepository(repo: UserRepository) {
  userRepo = repo;
}

// Tests
beforeEach(() => {
  const mockRepo = mockDeep<UserRepository>();
  setUserRepository(mockRepo);
});
```

### Multiple Repository Pattern
```typescript
// src/services/team.ts
let userRepo = new UserRepository();
let teamRepo = new TeamRepository();

export function setUserRepository(repo: UserRepository) {
  userRepo = repo;
}

export function setTeamRepository(repo: TeamRepository) {
  teamRepo = repo;
}

// Tests
beforeEach(() => {
  const userRepoMock = mockDeep<UserRepository>();
  const teamRepoMock = mockDeep<TeamRepository>();
  
  setUserRepository(userRepoMock);
  setTeamRepository(teamRepoMock);
});
```

### Handler Pattern
```typescript
// src/handlers/service/user.ts
let userService = UserService;

export function setUserService(service: typeof UserService) {
  userService = service;
}

// Tests
beforeEach(() => {
  const mockService = mockDeep<typeof UserService>();
  setUserService(mockService);
});
```

### TransactionManager with Repository Mocking
When testing services that use TransactionManager, you don't need to mock the TransactionManager itself. Since your repositories are mocked, the transaction logic will work correctly with the mocked repositories:

```typescript
describe("TeamService with transactions", () => {
  beforeEach(() => {
    const userRepoMock = mockDeep<UserRepository>();
    const teamRepoMock = mockDeep<TeamRepository>();
    
    setUserRepository(userRepoMock);
    setTeamRepository(teamRepoMock);
  });

  it("handles transactions with mocked repositories", async () => {
    // Setup repository mocks
    userRepoMock.findUnique.mockResolvedValue({ id: "captain-1" });
    teamRepoMock.create.mockResolvedValue(mockTeam);
    userRepoMock.update.mockResolvedValue(mockUser);
    
    // TransactionManager will use the mocked repositories
    const result = await TeamService.createTeam("captain-1", "Team Name");
    
    expect(result).toStrictEqual(mockTeam);
    // Verify all repository calls happened within transaction
    expect(userRepoMock.findUnique).toHaveBeenCalled();
    expect(teamRepoMock.create).toHaveBeenCalled();
    expect(userRepoMock.update).toHaveBeenCalled();
  });
});
```

## Testing Checklist

### Repository Tests
- [ ] CRUD operations work correctly
- [ ] Error handling for database errors
- [ ] Query building logic
- [ ] Transaction boundaries
- [ ] Relationship handling

### Service Tests
- [ ] Business validation rules
- [ ] Error cases and edge conditions
- [ ] Data transformation logic
- [ ] Multiple repository coordination
- [ ] Transaction rollback scenarios

### Handler Tests
- [ ] Request validation
- [ ] Response formatting
- [ ] HTTP status codes
- [ ] Error responses
- [ ] Authentication/authorization

### Integration Tests
- [ ] End-to-end workflows
- [ ] Database state changes
- [ ] External service integration
- [ ] Performance characteristics

## Common Testing Patterns

### Mock Reset Pattern
```typescript
beforeEach(() => {
  mockReset(mockInstance);
  vi.clearAllMocks();
});
```

### Error Testing Pattern
```typescript
it("handles errors gracefully", async () => {
  mockRepo.method.mockRejectedValue(new Error("Test error"));
  
  const result = await service.method();
  
  expect(result).toStrictEqual({ error: "Test error" });
});
```

### Async/Await Pattern
```typescript
it("handles async operations", async () => {
  mockRepo.method.mockResolvedValue(mockData);
  
  const result = await service.method();
  
  expect(result).toEqual(mockData);
});
```

## Running Tests

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# All tests
npm test

# Watch mode
npm run test:watch
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how
2. **One assertion per test**: Keep tests focused and readable
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock at boundaries**: Only mock external dependencies
5. **Avoid test interdependence**: Each test should be independent
6. **Use descriptive names**: Test names should describe what they test
7. **Keep tests fast**: Unit tests should run in milliseconds
8. **Test edge cases**: Don't just test the happy path