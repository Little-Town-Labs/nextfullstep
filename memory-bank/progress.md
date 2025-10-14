# Progress

## What Works

- Basic Next.js 14/15 app structure with App Router.
- AI integration with OpenAI GPT models.
- State management using Zustand.
- Authentication and role-based access control (planned).
- Styling with Tailwind CSS and Shadcn/ui.
- Environment variable management for API keys.
- Robust CSV import workflow for Big Five results.
- Multi-file upload and processing.
- Custom CSV parser handling Excel CSV formats.
- Database schema updated with userId and timestamps.
- User-facing upload page with multi-file support and detailed feedback.
- Consolidated navigation to a single header component.
- Backend DataSource initialization fixed for TypeORM.
- SQLite compatibility fixes for timestamp data type.
- AI coaching prompt customization feature implemented with admin UI and API.

## What's Left to Build

- Real user authentication and session management integration.
- Comprehensive validation and error handling for CSV uploads.
- Unit and integration tests for import and display workflows.
- Address TypeORM dependency warnings and optimize build configuration.
- Connect AI coaching workflows to use the customizable prompt.
- Add testing for prompt management APIs and UI.

## Current Status

- CSV import and display workflows are functional and tested with sample data.
- AI coaching prompt customization is implemented and ready for integration.
- Backend and frontend are integrated and stable.
- Some build warnings remain related to TypeORM dependencies.

## Known Issues

- TypeORM dependency warnings during build.
- No real authentication yet; userId is manually entered.

## Evolution of Project Decisions

- Switched from csv-parser to custom CSV parsing for better compatibility.
- Migrated API routes to Next.js App Router conventions.
- Added userId and createdAt fields to database schema.
- Improved frontend upload UI for multiple files and better feedback.
- Added AI coaching prompt customization with admin UI and API.