---
inclusion: always
---

# Study Swipe - Development Guidelines

Study Swipe is an educational NestJS application featuring swipe-based learning, user management, AI integration, and email notifications.

## Entity Standards

### Required Base Fields

All entities MUST include these audit fields:

```typescript
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;

@DeleteDateColumn({ name: 'deleted_at' })
deletedAt?: Date;
```

### Naming Conventions

- Database columns: `snake_case` (e.g., `created_at`, `user_id`)
- TypeScript properties: `camelCase` (e.g., `createdAt`, `userId`)
- Entity classes: `PascalCase` with `.entity.ts` suffix
- Always use `@Column({ name: 'snake_case_name' })` for explicit mapping

### Entity Structure Template

```typescript
@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'example_field' })
  exampleField: string;

  // Always include audit fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
```

## Controller Implementation

### Required Patterns

- Use `@UseGuards(JwtAuthGuard)` for protected endpoints
- Apply `@UsePipes(ValidationPipe)` for request validation
- Extract user from request: `@Request() req` then `req.user`
- Use appropriate HTTP methods and status codes

### Controller Template

```typescript
@Controller('resource')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() createDto: CreateResourceDto, @Request() req) {
    return this.resourceService.create(createDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req) {
    return this.resourceService.findAllByUser(req.user.id);
  }
}
```

## Service Layer Rules

### Implementation Requirements

- Inject repositories via constructor: `@InjectRepository(Entity)`
- Handle all business logic, never HTTP concerns
- Use TypeORM repository methods: `find()`, `findOne()`, `save()`, `softDelete()`
- Throw NestJS exceptions: `NotFoundException`, `BadRequestException`, `UnauthorizedException`

### Service Template

```typescript
@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  async create(
    createDto: CreateResourceDto,
    userId: number,
  ): Promise<Resource> {
    const resource = this.resourceRepository.create({
      ...createDto,
      userId,
    });
    return this.resourceRepository.save(resource);
  }
}
```

## DTO Validation Requirements

### Validation Rules

- Use `class-validator` decorators on all DTO properties
- Create separate DTOs for create/update operations
- Use `@Transform()` from `class-transformer` for data transformation
- Apply `@IsOptional()` for optional fields in update DTOs

### DTO Template

```typescript
export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

## API Response Standards

### Success Response Format

- Single resources: Return entity directly with all fields
- Collections: Use pagination format `{ data: [], total: number, page: number, limit: number }`
- Created resources: Return full entity with `201` status
- Updates: Return updated entity with `200` status
- Deletions: Return `204` with no content

### Required HTTP Status Codes

- `200`: Successful GET, PUT, PATCH operations
- `201`: Successful POST (resource creation)
- `204`: Successful DELETE operations
- `400`: Validation errors or bad requests
- `401`: Missing or invalid authentication
- `404`: Resource not found
- `403`: Insufficient permissions

## Security Requirements

### Authentication Implementation

- Use `JwtAuthGuard` for all protected routes
- Extract user from JWT payload via `@Request() req` then `req.user`
- User object contains: `{ id: number, email: string, ... }`
- Apply guards at controller level or individual route level

### Data Protection Rules

- Hash passwords using bcrypt with minimum 12 rounds
- Validate all inputs through DTOs with `class-validator`
- Use `@Transform()` decorators for data sanitization
- Never expose sensitive data in API responses (passwords, tokens)

### Environment Configuration

Required environment variables:

- `JWT_SECRET`: Strong random string for JWT signing
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access key
- `SMTP_*`: Email service configuration

## Service Integration Patterns

### Database Operations (TypeORM)

- Use `@InjectRepository(Entity)` for dependency injection
- Prefer repository methods over QueryBuilder for simple operations
- Use transactions for multi-step operations: `queryRunner.manager.save()`
- Apply soft deletes with `softDelete()` method, never `delete()`
- Use `findOne()` with relations: `{ relations: ['relatedEntity'] }`

### OpenAI Integration

- Wrap all API calls in try-catch blocks
- Handle rate limits with exponential backoff
- Log API usage and costs for monitoring
- Validate AI responses before using in application
- Use environment variable `OPENAI_API_KEY`

### Email Service (Nodemailer)

- Support both HTML and plain text email formats
- Use environment variables for SMTP configuration
- Implement proper error handling for delivery failures
- Create reusable email templates
- Queue emails for bulk operations

## SOLID Principles

### Single Responsibility Principle (SRP)

- Each class should have only one reason to change
- Controllers handle HTTP requests only, delegate business logic to services
- Services contain business logic only, delegate data access to repositories
- DTOs handle data validation and transformation only
- Entities represent database structure only

### Open-Closed Principle (OCP)

- Classes should be open for extension but closed for modification
- Use interfaces and abstract classes for extensibility
- Implement strategy pattern for varying algorithms (e.g., different AI providers)
- Use dependency injection to swap implementations without code changes

### Liskov Substitution Principle (LSP)

- Derived classes must be substitutable for their base classes
- All implementations of an interface must honor the contract
- Subclasses should not strengthen preconditions or weaken postconditions
- Use proper inheritance hierarchies for entities and services

### Interface Segregation Principle (ISP)

- Clients should not depend on interfaces they don't use
- Create specific, focused interfaces rather than large, monolithic ones
- Split large service interfaces into smaller, role-specific interfaces
- Use composition over inheritance when appropriate

### Dependency Inversion Principle (DIP)

- High-level modules should not depend on low-level modules; both should depend on abstractions
- Use NestJS dependency injection container extensively
- Inject interfaces/abstractions, not concrete implementations
- Create repository interfaces for data access abstraction

### SOLID Implementation Examples

```typescript
// SRP: Separate concerns
@Injectable()
export class UserService {
  // Only handles user business logic
}

@Injectable()
export class EmailService {
  // Only handles email operations
}

// DIP: Depend on abstractions
interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

@Injectable()
export class UserService {
  constructor(@Inject('IEmailService') private emailService: IEmailService) {}
}
```

## Business Domain Rules

### User Management

- All users must have verified email addresses
- Implement secure password reset with time-limited tokens
- Track user study progress and learning preferences
- Associate all user-generated content with user ID

### Study Content & Learning

- All study content must be associated with user profiles
- Implement swipe actions: like, dislike, skip with tracking
- Store learning analytics for progress monitoring
- Use AI to generate personalized content recommendations
- Track completion rates and learning outcomes

### Data Relationships

- Users have one Profile (one-to-one)
- Users can have multiple StudyCards (one-to-many)
- StudyCards belong to Categories (many-to-one)
- Track user interactions with SwipeActions (many-to-many through junction)
