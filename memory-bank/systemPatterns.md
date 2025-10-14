# System Patterns

- The system uses Next.js 14/15 with the App Router for server and client components.
- AI integration is done via OpenAI GPT models, with model selection currently hardcoded in src/app/actions.tsx.
- State management is handled using Zustand stores.
- Authentication uses JWT with role-based access control.
- SQLite with TypeORM is used for database management, following security best practices.
- Environment variables store API keys securely.
- The system follows strict TypeScript mode and enforces coding standards.
- API routes handle user input, AI processing, and state updates in a clear data flow.
- Tailwind CSS and Shadcn/ui are used for styling and UI components.