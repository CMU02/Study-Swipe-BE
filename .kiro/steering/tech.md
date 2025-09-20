# Technology Stack

## Framework & Runtime
- **NestJS**: Progressive Node.js framework for building scalable server-side applications
- **Node.js**: Runtime environment
- **TypeScript**: Primary language with strict configuration

## Database & ORM
- **PostgreSQL**: Primary database
- **TypeORM**: Database ORM with entity auto-loading enabled
- Database synchronization is disabled (manual migrations required)

## Key Dependencies
- **OpenAI**: AI integration capabilities
- **Nodemailer**: Email functionality
- **RxJS**: Reactive programming support

## Development Tools
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting (single quotes, trailing commas)
- **Jest**: Testing framework for unit and e2e tests

## Common Commands

### Development
```bash
npm run start:dev    # Start with hot reload and .env file
npm run start:debug  # Start with debugging enabled
```

### Building & Production
```bash
npm run build        # Build the application
npm run start:prod   # Run production build
```

### Code Quality
```bash
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
npm run test:e2e     # Run end-to-end tests
```

## Configuration
- Environment variables loaded from `.env` file in development
- TypeScript with ES2023 target and experimental decorators
- CORS configured for localhost:3000 frontend integration