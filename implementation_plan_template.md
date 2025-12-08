# Finance Projection Calculator - Implementation Plan Template

> [!IMPORTANT]
> **How to Use This Template**: This template is designed for optimal AI prompt engineering. Fill in each section with specific, detailed information. The more context and clarity you provide, the better the AI can assist you.

---

## 📋 Project Overview

### Problem Statement
<!-- Describe the specific problem this feature/component solves -->
**What**: [Clear description of what you're building]

**Why**: [Business/user need this addresses]

**Success Criteria**: [How you'll know this is complete and working correctly]

### Context & Background
<!-- Provide comprehensive background information -->
- **Current State**: [What exists now, if anything]
- **Target Users**: [Who will use this feature]
- **Key Requirements**: [Must-have functionality]
- **Technical Constraints**: [Performance requirements, browser support, etc.]

---

## 🎯 AI Prompt Engineering Guidelines

> [!TIP]
> **Best Practices for Prompting**:
> 1. **Be Specific**: Specify exact technologies, versions, and frameworks
> 2. **Provide Context**: Include existing code patterns, architectural decisions
> 3. **Use Examples**: Show desired input/output or code style
> 4. **Break Down Tasks**: Request smaller, incremental changes
> 5. **Specify Format**: Define how you want responses structured
> 6. **Request Quality**: Ask for error handling, tests, and documentation

### Recommended Prompt Structure
```
You are a [ROLE - e.g., senior full-stack developer specializing in React and Go].

CONTEXT:
[Provide project background, existing architecture, coding standards]

TASK:
[Clear, specific task description]

REQUIREMENTS:
- [Specific requirement 1]
- [Specific requirement 2]
- [Include error handling, type safety, testing requirements]

CONSTRAINTS:
- [Technology constraints]
- [Performance requirements]
- [Code style/patterns to follow]

EXPECTED OUTPUT:
[Describe format: code only, code with explanation, step-by-step guide, etc.]

EXAMPLES:
[If applicable, provide input/output examples or existing code patterns to follow]
```

---

## 🎨 Frontend Implementation

### Technology Stack
- **Framework**: [e.g., React 18.x with TypeScript]
- **Build Tool**: [e.g., Vite 5.x]
- **Styling**: [e.g., TailwindCSS 3.x / Vanilla CSS]
- **State Management**: [e.g., React Context, Redux, Zustand]
- **UI Components**: [e.g., shadcn/ui, custom components]
- **Charts/Visualizations**: [e.g., Recharts, Chart.js, D3.js]
- **Testing**: [e.g., Vitest, React Testing Library]

### Component Architecture

#### Component: [Component Name]
**Location**: `src/components/[ComponentName].tsx`

**Purpose**: [What this component does]

**Props Interface**:
```typescript
interface [ComponentName]Props {
  // Define expected props with types
  exampleProp: string;
  onAction?: () => void;
}
```

**State Management**: [Describe local state, context usage, or global state]

**Key Features**:
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

**AI Prompt for This Component**:
```
You are a senior React developer with expertise in TypeScript and modern React patterns.

CONTEXT:
- This is part of a finance projection calculator application
- We follow [coding standards from existing codebase]
- Existing components use [pattern/style]

TASK:
Create a React component named [ComponentName] that [specific functionality].

REQUIREMENTS:
- Use TypeScript with strict mode
- Implement proper error handling for [specific scenarios]
- Follow the existing prop pattern: [example from codebase]
- Add JSDoc comments for complex logic
- Ensure accessibility (ARIA labels, keyboard navigation)
- Make responsive for mobile/tablet/desktop

INPUT/OUTPUT EXAMPLE:
Input: { value: 1000, type: 'income' }
Output: Displays formatted currency with appropriate styling

STYLING:
- Use [TailwindCSS utility classes / CSS modules]
- Follow existing color scheme: [colors]
- Animations: [any specific animation requirements]

TESTING:
- Include unit tests using Vitest
- Test edge cases: [list specific edge cases]
```

---

### State Management Strategy

**Global State** (Context/Redux/Zustand):
- [ ] [State slice 1]: [What it manages]
- [ ] [State slice 2]: [What it manages]

**Local Component State**:
- [ ] [Component name]: [State requirements]

**Data Flow**:
```
[Describe how data flows through your application]
User Input → Component → Context/Store → API Call → State Update → UI Re-render
```

---

### API Integration

#### Endpoint: [Endpoint Name]
**Method**: `[GET/POST/PUT/DELETE]`  
**Path**: `/api/v1/[resource]`

**Request**:
```typescript
interface [RequestName] {
  // Define request structure
}
```

**Response**:
```typescript
interface [ResponseName] {
  // Define response structure
}
```

**Error Handling**:
- [ ] Network errors
- [ ] Validation errors
- [ ] Authentication errors

**AI Prompt for API Integration**:
```
You are a senior frontend developer experienced with REST API integration.

CONTEXT:
- React app using [fetch/axios]
- Backend API at [base URL]
- Authentication using [JWT/OAuth/etc]

TASK:
Create a type-safe API client for [specific endpoint].

REQUIREMENTS:
- Use TypeScript interfaces for request/response
- Implement comprehensive error handling for:
  * Network failures
  * 400/401/403/404/500 errors
  * Timeout scenarios
- Add request/response interceptors for [auth, logging]
- Include loading and error states
- Implement retry logic for [specific scenarios]

CODE STYLE:
Follow this pattern from existing code:
[paste example API call from codebase]

TESTING:
- Mock API responses
- Test error scenarios
- Test retry logic
```

---

## ⚙️ Backend Implementation

### Technology Stack
- **Language**: [e.g., Go 1.21+]
- **Framework**: [e.g., Gin, Echo, standard library]
- **Database**: [e.g., PostgreSQL 15+]
- **ORM/Query Builder**: [e.g., GORM, sqlx]
- **Authentication**: [e.g., JWT, OAuth]
- **API Documentation**: [e.g., Swagger/OpenAPI]
- **Testing**: [e.g., testify, go test]

### Architecture Pattern
- [ ] **Pattern**: [e.g., Clean Architecture, Layered Architecture, Hexagonal]
- [ ] **Layers**: 
  - Handler/Controller
  - Service/Use Case
  - Repository/Data Access
  - Model/Entity

---

### Database Schema

#### Table: [table_name]
```sql
CREATE TABLE [table_name] (
    id SERIAL PRIMARY KEY,
    [column_name] [TYPE] [CONSTRAINTS],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
```sql
CREATE INDEX idx_[name] ON [table_name]([column]);
```

**AI Prompt for Database Schema**:
```
You are a senior database architect specializing in PostgreSQL.

CONTEXT:
- Finance projection calculator application
- Expected [X] users, [Y] transactions per day
- Current schema: [describe existing tables]

TASK:
Design a database schema for [specific feature].

REQUIREMENTS:
- Normalize to 3NF to avoid redundancy
- Add appropriate indexes for query performance on [specific queries]
- Include constraints for data integrity (foreign keys, check constraints)
- Add timestamps (created_at, updated_at, deleted_at for soft deletes)
- Consider scalability for [specific growth expectations]

PERFORMANCE REQUIREMENTS:
- Queries should complete in < [X]ms
- Optimize for [read-heavy/write-heavy] workload

OUTPUT FORMAT:
Provide SQL migration files (up and down) and explain indexing decisions.
```

---

### API Endpoints

#### Endpoint: [Endpoint Name]
**Route**: `[METHOD] /api/v1/[resource]`  
**Handler**: `[HandlerName]`  
**Description**: [What this endpoint does]

**Request**:
```go
type [RequestType] struct {
    Field1 string `json:"field1" binding:"required"`
    Field2 int    `json:"field2" binding:"min=0"`
}
```

**Response**:
```go
type [ResponseType] struct {
    ID     uint   `json:"id"`
    Field1 string `json:"field1"`
}
```

**Business Logic**:
1. [Step 1: e.g., Validate input]
2. [Step 2: e.g., Check permissions]
3. [Step 3: e.g., Perform calculation]
4. [Step 4: e.g., Save to database]
5. [Step 5: e.g., Return response]

**Error Cases**:
- [ ] `400 Bad Request`: [When this occurs]
- [ ] `401 Unauthorized`: [When this occurs]
- [ ] `404 Not Found`: [When this occurs]
- [ ] `500 Internal Server Error`: [When this occurs]

**AI Prompt for API Endpoint**:
```
You are a senior Go backend developer with expertise in [framework] and clean architecture.

CONTEXT:
- We use a layered architecture: Handler → Service → Repository
- Existing code follows these patterns: [paste example handler]
- Database models are defined in: [location]
- We use [GORM/sqlx] for database operations

TASK:
Implement the [METHOD] /api/v1/[resource] endpoint.

REQUIREMENTS:
- Follow existing handler pattern
- Validate input using struct tags and custom validators
- Return appropriate HTTP status codes
- Log errors using [logging framework]
- Add OpenAPI/Swagger annotations for documentation
- Implement transaction handling for [specific operations]
- Add proper error handling with user-friendly messages

BUSINESS LOGIC:
[Describe the specific business rules step-by-step]

SECURITY:
- Require JWT authentication
- Validate user permissions for [specific actions]
- Sanitize inputs to prevent SQL injection
- Rate limit to [X] requests per minute

TESTING:
- Write table-driven unit tests
- Test edge cases: [list specific scenarios]
- Mock database layer using [mocking library]
```

---

### Service Layer

#### Service: [ServiceName]
**Location**: `internal/service/[service_name].go`

**Purpose**: [Business logic this service handles]

**Dependencies**:
- [ ] Repository: [RepositoryName]
- [ ] External API: [If applicable]
- [ ] Other Services: [If applicable]

**Methods**:
```go
type [ServiceName]Service interface {
    Create(ctx context.Context, input [InputType]) ([OutputType], error)
    GetByID(ctx context.Context, id uint) ([OutputType], error)
    // ... other methods
}
```

**AI Prompt for Service Layer**:
```
You are a senior Go developer specializing in clean architecture and domain-driven design.

CONTEXT:
- Service layer contains business logic
- Services depend on repositories for data access
- Existing service pattern: [paste example]

TASK:
Implement [ServiceName]Service with the following methods: [list methods].

REQUIREMENTS:
- Accept context.Context as first parameter for all methods
- Return domain errors, not database errors
- Implement business validation logic: [specific rules]
- Use transactions for multi-step operations
- Add comprehensive logging
- Handle edge cases: [list scenarios]

BUSINESS RULES:
[Describe complex business logic step-by-step]

ERROR HANDLING:
- Define custom error types for business logic failures
- Wrap repository errors with context
- Return meaningful error messages for API responses

TESTING:
- Write unit tests with mocked repositories
- Test all business logic branches
- Test error scenarios
```

---

### Repository Layer

#### Repository: [RepositoryName]
**Location**: `internal/repository/[repository_name].go`

**Purpose**: [Data access for which entities]

**Methods**:
```go
type [RepositoryName]Repository interface {
    Create(ctx context.Context, entity *[Entity]) error
    FindByID(ctx context.Context, id uint) (*[Entity], error)
    // ... other methods
}
```

**AI Prompt for Repository Layer**:
```
You are a senior Go developer with expertise in database design and [ORM/query builder].

CONTEXT:
- Using [PostgreSQL/MySQL] database
- ORM: [GORM/sqlx/database/sql]
- Existing repository pattern: [paste example]

TASK:
Implement [RepositoryName]Repository with CRUD operations and [specific query methods].

REQUIREMENTS:
- Use context.Context for cancellation support
- Implement optimized queries with proper indexes
- Use prepared statements to prevent SQL injection
- Handle database errors gracefully
- Support pagination for list operations
- Use transactions where appropriate

QUERIES TO OPTIMIZE:
- [Specific query 1]: Expected to handle [X] rows
- [Specific query 2]: Should complete in < [Y]ms

ERROR HANDLING:
- Distinguish between "not found" and other errors
- Log SQL errors with enough context for debugging
- Return repository-specific errors

TESTING:
- Use [testing library/approach]
- Test with real database in integration tests
- Use transactions for test isolation
```

---

## 🔐 Authentication & Authorization

### Authentication Strategy
- **Method**: [e.g., JWT, OAuth 2.0, Session-based]
- **Token Storage**: [e.g., HTTP-only cookies, localStorage]
- **Token Expiry**: [e.g., 15 minutes access, 7 days refresh]

### Authorization Roles
- [ ] **Role 1**: [Permissions]
- [ ] **Role 2**: [Permissions]

**AI Prompt for Auth Implementation**:
```
You are a senior security-focused developer with expertise in authentication and authorization.

CONTEXT:
- Application requires user authentication
- Tech stack: [Frontend framework] + [Backend framework]

TASK:
Implement secure JWT-based authentication system.

REQUIREMENTS:
- Generate JWT tokens with [claims]
- Implement refresh token rotation
- Secure token storage (HTTP-only cookies recommended)
- Add middleware to protect routes
- Implement password hashing using [bcrypt/argon2]
- Add rate limiting on auth endpoints (prevent brute force)
- Validate token on every protected request

SECURITY CONSIDERATIONS:
- CSRF protection for state-changing operations
- XSS protection through Content Security Policy
- Token expiration and rotation strategy
- Secure password requirements (minimum length, complexity)

TESTING:
- Test authentication flow (login, logout, refresh)
- Test authorization (access control for different roles)
- Test security: expired tokens, invalid tokens, etc.
```

---

## 🧪 Testing Strategy

### Frontend Testing

#### Unit Tests
- **Tool**: [e.g., Vitest, Jest]
- **Coverage Target**: [e.g., 80%]

**Components to Test**:
- [ ] [Component 1]: [Key scenarios]
- [ ] [Component 2]: [Key scenarios]

#### Integration Tests
- **Tool**: [e.g., React Testing Library]
- [ ] User flows: [Describe key user journeys]

#### E2E Tests
- **Tool**: [e.g., Playwright, Cypress]
- [ ] Critical paths: [List critical user paths]

**AI Prompt for Frontend Testing**:
```
You are a senior QA engineer specializing in frontend test automation.

CONTEXT:
- React app with [state management]
- Testing stack: [Vitest + React Testing Library]

TASK:
Write comprehensive tests for [ComponentName].

REQUIREMENTS:
- Unit tests for all component logic
- Test user interactions (clicks, form inputs)
- Test edge cases: [list scenarios]
- Mock API calls using [mocking library]
- Test loading states, error states, success states
- Ensure accessibility testing (check ARIA labels)

TEST COVERAGE:
- Aim for 80%+ code coverage
- Focus on critical business logic
- Test error boundaries

OUTPUT FORMAT:
Provide tests in [describe/it or test] blocks with clear descriptions.
```

---

### Backend Testing

#### Unit Tests
- **Tool**: [e.g., go test, testify]
- **Coverage Target**: [e.g., 80%]

**Layers to Test**:
- [ ] Services: [Business logic tests]
- [ ] Repositories: [Data access tests]
- [ ] Handlers: [Request/response tests]

#### Integration Tests
- **Database**: [e.g., Test containers, in-memory DB]
- [ ] API endpoints: [Key scenarios]

**AI Prompt for Backend Testing**:
```
You are a senior Go developer with expertise in test-driven development.

CONTEXT:
- Go backend using [framework]
- Testing with [testify/standard library]

TASK:
Write comprehensive tests for [ServiceName/HandlerName/RepositoryName].

REQUIREMENTS:
- Use table-driven tests for multiple scenarios
- Mock dependencies using [mocking approach]
- Test all business logic branches
- Test error cases exhaustively
- Use subtests for organized test output
- Setup and teardown for test isolation

TEST SCENARIOS:
- Happy path: [describe]
- Edge cases: [list scenarios]
- Error cases: [list error scenarios]
- Boundary conditions: [e.g., empty input, max values]

INTEGRATION TESTS:
- Use [testcontainers/dockertest] for real database
- Test full request → response cycle
- Test database transactions and rollbacks

OUTPUT FORMAT:
Provide tests with clear naming (Test[FunctionName]_[Scenario])
```

---

## 📊 Performance Requirements

### Frontend Performance
- [ ] **Initial Load**: < [X] seconds
- [ ] **Time to Interactive**: < [Y] seconds
- [ ] **Bundle Size**: < [Z] MB
- [ ] **Lighthouse Score**: > [score]

**Optimization Strategies**:
- Code splitting
- Lazy loading
- Image optimization
- Memoization for expensive calculations

### Backend Performance
- [ ] **API Response Time**: < [X]ms (p95)
- [ ] **Database Query Time**: < [Y]ms
- [ ] **Throughput**: [Z] requests/second
- [ ] **Concurrent Users**: Support [N] concurrent users

**Optimization Strategies**:
- Database indexing
- Query optimization
- Caching strategy (Redis, in-memory)
- Connection pooling

**AI Prompt for Performance Optimization**:
```
You are a senior performance engineer with expertise in [frontend/backend] optimization.

CONTEXT:
- [Describe current performance metrics]
- Bottlenecks identified: [list bottlenecks]

TASK:
Optimize [specific component/endpoint] to meet performance targets.

REQUIREMENTS:
- Achieve < [X]ms response time
- Reduce bundle size by [Y]%
- Implement [caching strategy]
- Add performance monitoring with [tool]

ANALYSIS:
First, analyze the current code and identify performance issues. Then, propose specific optimizations with expected impact.

IMPLEMENTATION:
Provide optimized code with explanations for each change.

MEASUREMENT:
Include benchmarks and performance testing code.
```

---

## 🚀 Deployment & DevOps

### Deployment Strategy
- **Frontend**: [e.g., Netlify, Vercel, S3 + CloudFront]
- **Backend**: [e.g., Render, AWS ECS, DigitalOcean]
- **Database**: [e.g., RDS, Managed PostgreSQL]

### Environment Variables
```
# Frontend (.env)
VITE_API_BASE_URL=[backend URL]
VITE_[OTHER_VARS]

# Backend (.env)
DATABASE_URL=[connection string]
JWT_SECRET=[secret key]
[OTHER_VARS]
```

### CI/CD Pipeline
- [ ] Automated testing on PR
- [ ] Linting and formatting checks
- [ ] Build and deploy on merge to main
- [ ] Database migrations

**AI Prompt for Deployment Config**:
```
You are a senior DevOps engineer experienced with [cloud provider].

CONTEXT:
- Application stack: [describe]
- Deployment target: [platform]

TASK:
Create deployment configuration for [frontend/backend/database].

REQUIREMENTS:
- Docker containerization (if applicable)
- Environment variable management
- Auto-scaling configuration for [expected load]
- Health check endpoints
- Logging and monitoring setup
- Backup strategy for database

SECURITY:
- Secrets management
- HTTPS/TLS configuration
- Firewall rules

OUTPUT:
Provide configuration files (Dockerfile, docker-compose.yml, CI/CD config) with explanations.
```

---

## 📝 Documentation Requirements

- [ ] **API Documentation**: [Swagger/OpenAPI, Postman collection]
- [ ] **Code Comments**: JSDoc/GoDoc for complex functions
- [ ] **README**: Setup instructions, architecture overview
- [ ] **User Guide**: [If applicable]

---

## ✅ Definition of Done

A feature is considered complete when:
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Deployed to staging and verified
- [ ] Performance requirements met
- [ ] Security review completed (if applicable)
- [ ] Accessibility requirements met

---

## 🎯 Next Steps / Actions Required

1. [ ] [Specific action item 1]
2. [ ] [Specific action item 2]
3. [ ] [Specific action item 3]

---

## 📌 Notes & Decisions

### Key Decisions
- **Decision 1**: [What was decided and why]
- **Decision 2**: [What was decided and why]

### Open Questions
- [ ] [Question that needs resolution]
- [ ] [Question that needs resolution]

### References
- [Link to design doc]
- [Link to API spec]
- [Link to related tickets]

---

## 🔄 Iterative Workflow with AI

> [!TIP]
> **Recommended Approach for Working with AI**:
> 
> 1. **Start Small**: Begin with one component or feature at a time
> 2. **Provide Context**: Share this implementation plan section
> 3. **Request Incremental Changes**: Don't ask for everything at once
> 4. **Review & Test**: Always review generated code and run tests
> 5. **Refine Prompts**: If output isn't right, refine your prompt with more specific requirements
> 6. **Ask for Explanations**: Request step-by-step explanations for complex logic
> 7. **Version Control**: Commit frequently as you integrate AI-generated code

### Sample Workflow
```
1. Share relevant section of this plan with AI
2. Request: "Implement [specific component] following the requirements above"
3. Review generated code
4. If issues: "The [specific part] doesn't handle [scenario]. Please update to [requirement]"
5. Test thoroughly
6. Request: "Now write tests for this component covering [scenarios]"
7. Review tests and run them
8. Move to next component
```

---

**Template Version**: 1.0  
**Last Updated**: 2025-12-07  
**Created By**: Antigravity AI Assistant
