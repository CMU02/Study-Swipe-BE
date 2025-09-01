# Project Structure

## Root Directory
```
study-swipe/
├── src/                 # Source code
├── test/               # End-to-end tests
├── dist/               # Compiled output (generated)
├── node_modules/       # Dependencies (generated)
└── [config files]      # Various configuration files
```

## Source Code Organization (`src/`)
- **main.ts**: Application entry point with CORS and server setup
- **app.module.ts**: Root module with TypeORM configuration
- **app.controller.ts**: Main application controller
- **app.service.ts**: Main application service
- **app.controller.spec.ts**: Unit tests for controller

## Testing Structure (`test/`)
- **app.e2e-spec.ts**: End-to-end test specifications
- **jest-e2e.json**: E2E testing configuration

## Configuration Files
- **package.json**: Dependencies and npm scripts
- **tsconfig.json**: TypeScript configuration with ES2023 target
- **tsconfig.build.json**: Build-specific TypeScript config
- **eslint.config.mjs**: ESLint configuration with TypeScript support
- **.prettierrc**: Code formatting rules (single quotes, trailing commas)
- **nest-cli.json**: NestJS CLI configuration
- **.env**: Environment variables (not tracked in git)
- **.gitignore**: Git ignore patterns

## Architecture Patterns
- **Module-based**: NestJS modular architecture
- **Dependency Injection**: Built-in DI container usage
- **Decorator Pattern**: Extensive use of TypeScript decorators
- **Repository Pattern**: TypeORM entities and repositories
- **Controller-Service Pattern**: Separation of HTTP handling and business logic

## File Naming Conventions
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Modules: `*.module.ts`
- Tests: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)
- Entities: `*.entity.ts` (when created)

## Import Organization
- NestJS imports first
- Third-party libraries
- Local imports (relative paths)