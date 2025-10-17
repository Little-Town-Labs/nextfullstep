# AI Interaction Design for Professional Development Platform

This design outlines the functionality for interacting with the AI in the Professional Development Platform to process personality test scores, resumes, and user text inputs, generate career advice, and persist data for future coaching and goal planning. The design leverages the existing tech stack and project details as specified.

## System Overview
The AI interaction feature enables users to submit personality test scores, upload resumes in PDF format, and provide custom text inputs. These inputs, combined with a customized prompt, are processed by Grok 3 Mini Beta via the Vercel AI SDK to generate formatted job and career advice, mimicking a career coach. All data is stored in an SQLite database (noting the tech context mentions PostgreSQL, but activeContext and progress specify SQLite) for later use in coaching and goal planning.

## Architecture
The feature follows the microservices architecture outlined in `systemPatterns.md`, using Next.js for server-side rendering, TypeORM for SQLite database interactions, and the Vercel AI SDK for AI processing. Components are organized using the MVC pattern, with clear separation of concerns between user input handling, AI processing, and data persistence.

### Component Relationships
- **Frontend**: Next.js/React components for input forms (assessment scores, PDF upload, text input) and displaying AI-generated advice.
- **Backend**: Node.js/Express API endpoints to handle input processing, AI interaction, and database operations.
- **AI Service**: Vercel AI SDK integrates with Grok 3 Mini Beta to process inputs and generate career advice.
- **Database**: SQLite with TypeORM stores user inputs, AI outputs, and metadata for future retrieval.
- **State Management**: Zustand manages UI state (e.g., form data, loading states) for a seamless user experience.

## Data Flow
1. **User Input**:
   - Users enter personality test scores (e.g., Big Five, Holland Code) via a form.
   - Users upload resumes in PDF format.
   - Users provide custom text input (e.g., career goals or context).
   - Users optionally customize the AI prompt or use a default one.
2. **Processing**:
   - The frontend sends inputs to a backend API endpoint.
   - The backend extracts text from PDFs using a library like `pdf-parse`.
   - Inputs are combined with the prompt and sent to Grok 3 Mini Beta via Vercel AI SDK.
3. **AI Output**:
   - Grok 3 Mini Beta generates formatted career advice (e.g., job recommendations, skill development plans).
   - The backend formats the response for consistency (e.g., JSON with sections for advice, goals, and resources).
4. **Persistence**:
   - Inputs (scores, resume text, user text, prompt) and AI output are saved to SQLite via TypeORM.
   - Data is linked to the user’s profile for future coaching sessions.
5. **Display**:
   - The frontend renders the advice in a user-friendly format, with options to save or revisit later.

## Database Schema
The SQLite database will include tables to store AI interaction data, linked to user profiles and assessment results.

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;

  @OneToMany(() => AiSession, aiSession => aiSession.user)
  aiSessions: AiSession[];
}

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  careerGoals?: string;
}

@Entity()
export class AiSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.aiSessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column('simple-json', { nullable: true })
  scores?: Record<string, any>; // Stores personality test scores

  @Column({ type: 'text', nullable: true })
  resumeText?: string;

  @Column({ type: 'text', nullable: true })
  userInput?: string;

  @Column()
  prompt: string;

  @Column('simple-json')
  aiOutput: Record<string, any>; // AI-generated advice
}
```

- **User**: Stores user authentication data (linked to NextAuth.js).
- **Profile**: Stores user metadata like career goals and avatar.
- **AiSession**: Stores each AI interaction, including inputs and outputs, for history and future reference.

## API Endpoints
The backend exposes RESTful endpoints to handle AI interactions, built with Next.js API routes.

### POST `/api/ai/career-advice`
- **Purpose**: Processes user inputs and returns AI-generated career advice.
- **Request Body**:
  ```json
  {
    "scores": { "BigFive": { "openness": 80, "conscientiousness": 75, ... }, ... },
    "resume": "base64-encoded-pdf-string",
    "userInput": "I want to transition to tech from marketing.",
    "prompt": "Analyze the provided scores, resume, and input to suggest career paths and skills."
  }
  ```
- **Response**:
  ```json
  {
    "sessionId": 1,
    "advice": {
      "jobs": ["Software Engineer", "Product Manager"],
      "skills": ["Python", "Agile Methodologies"],
      "plan": "Enroll in a coding bootcamp and network with tech professionals."
    }
  }
  ```
- **Logic**:
  - Validates inputs and decodes the resume PDF.
  - Extracts resume text using `pdf-parse`.
  - Combines inputs with the prompt and queries Grok 3 Mini Beta.
  - Saves inputs and output to the `AiSession` table.
  - Returns the formatted advice.

### GET `/api/ai/sessions/[userId]`
- **Purpose**: Retrieves a user’s past AI sessions for coaching or goal planning.
- **Response**:
  ```json
  [
    {
      "id": 1,
      "createdAt": "2025-04-15T04:25:00Z",
      "scores": { ... },
      "resumeText": "...",
      "userInput": "...",
      "prompt": "...",
      "aiOutput": { ... }
    },
    ...
  ]
  ```
- **Logic**:
  - Queries the `AiSession` table by `userId`.
  - Returns a list of sessions for display or further processing.

## Frontend Components
The UI is built with React and TypeScript, styled with Tailwind CSS, and follows Next.js 14/15 best practices.

### `AiInteractionForm.tsx`
A form for collecting user inputs and uploading resumes.

```tsx
import { useState } from 'react';
import { useZustandStore } from '@/store';
import { uploadResume } from '@/utils/api';

export default function AiInteractionForm() {
  const [scores, setScores] = useState({});
  const [resume, setResume] = useState<File | null>(null);
  const [userInput, setUserInput] = useState('');
  const [prompt, setPrompt] = useState('Analyze inputs for career advice.');
  const setLoading = useZustandStore((state) => state.setLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resumeBase64 = resume ? await toBase64(resume) : null;
      const response = await uploadResume({ scores, resume: resumeBase64, userInput, prompt });
      // Handle response (e.g., display advice)
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Personality Test Scores</label>
        <textarea
          value={JSON.stringify(scores)}
          onChange={(e) => setScores(JSON.parse(e.target.value))}
          className="w-full p-2 border"
        />
      </div>
      <div>
        <label>Resume (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResume(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>
      <div>
        <label>Custom Input</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-2 border"
        />
      </div>
      <div>
        <label>Custom Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white">
        Get Career Advice
      </button>
    </form>
  );
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
```

### `AdviceDisplay.tsx`
Displays the AI-generated career advice.

```tsx
import { useEffect } from 'react';
import { useZustandStore } from '@/store';

export default function AdviceDisplay({ sessionId }: { sessionId: number }) {
  const [advice, setAdvice] = useZustandStore((state) => [state.advice, state.setAdvice]);

  useEffect(() => {
    // Fetch advice by sessionId if not already loaded
    const fetchAdvice = async () => {
      const response = await fetch(`/api/ai/sessions/${sessionId}`);
      const data = await response.json();
      setAdvice(data.aiOutput);
    };
    if (!advice && sessionId) fetchAdvice();
  }, [sessionId, advice, setAdvice]);

  if (!advice) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">Career Advice</h2>
      <h3>Recommended Jobs</h3>
      <ul>
        {advice.jobs.map((job: string, index: number) => (
          <li key={index}>{job}</li>
        ))}
      </ul>
      <h3>Skills to Develop</h3>
      <ul>
        {advice.skills.map((skill: string, index: number) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
      <h3>Development Plan</h3>
      <p>{advice.plan}</p>
    </div>
  );
}
```

## Backend Implementation
The backend processes inputs and interacts with the AI and database.

### `/pages/api/ai/career-advice.ts`
Handles AI interaction requests.

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepository } from 'typeorm';
import { AiSession } from '@/entities/AiSession';
import { parsePDF } from '@/utils/pdf-parse';
import { generateCareerAdvice } from '@/utils/ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scores, resume, userInput, prompt } = req.body;
    const userId = req.user?.id; // From NextAuth.js session

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract resume text if provided
    let resumeText = null;
    if (resume) {
      resumeText = await parsePDF(Buffer.from(resume, 'base64'));
    }

    // Generate AI advice
    const aiOutput = await generateCareerAdvice({ scores, resumeText, userInput, prompt });

    // Save to database
    const aiSessionRepository = getRepository(AiSession);
    const session = await aiSessionRepository.save({
      userId,
      scores: scores || null,
      resumeText,
      userInput,
      prompt,
      aiOutput,
    });

    return res.status(200).json({ sessionId: session.id, advice: aiOutput });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### `/utils/pdf-parse.ts`
Extracts text from PDFs.

```ts
import pdf from 'pdf-parse';

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF');
  }
}
```

### `/utils/ai.ts`
Interacts with Grok 3 Mini Beta.

```ts
import { AI } from '@vercel/ai-sdk';

export async function generateCareerAdvice({
  scores,
  resumeText,
  userInput,
  prompt,
}: {
  scores?: any;
  resumeText?: string;
  userInput?: string;
  prompt: string;
}) {
  const ai = new AI({ model: 'grok-3-mini-beta' });
  const input = `
    Scores: ${JSON.stringify(scores) || 'None'}
    Resume: ${resumeText || 'None'}
    User Input: ${userInput || 'None'}
    Prompt: ${prompt}
  `;
  const response = await ai.generate({ input });
  return JSON.parse(response); // Assumes AI returns JSON-formatted advice
}
```

## Security Considerations
- **Authentication**: Use NextAuth.js to secure API endpoints, ensuring only authenticated users can submit or access AI sessions.
- **Data Validation**: Validate inputs (scores, userInput, prompt) to prevent injection attacks.
- **PDF Handling**: Sanitize PDF uploads to prevent malicious content, using a library like `pdf-parse` in a sandboxed environment.
- **Database**: Follow SQLite security best practices, using parameterized queries via TypeORM to prevent SQL injection.
- **GDPR Compliance**: Store only necessary data and allow users to delete their AI sessions, as per `techContext.md`.

## Gamification Integration
To align with the project’s emphasis on gamification (`activeContext.md`, `projectbrief.md`):
- Award points for completing AI interactions (e.g., submitting inputs or reviewing advice).
- Unlock badges for milestones (e.g., “Career Explorer” for three AI sessions).
- Display progress in a dashboard linked to the `AiSession` table, showing session history and insights.

## Persistence for Coaching and Goal Planning
The `AiSession` table stores all inputs and outputs, enabling:
- **Coaching**: Retrieve past sessions to review advice or refine goals (via `GET /api/ai/sessions/[userId]`).
- **Goal Planning**: Use stored `aiOutput` to generate development plans or calendar check-ins, linking to the growth center module (`progress.md`).
- **Analytics**: Aggregate session data to track engagement (e.g., 70% completing 3+ assessments, per `projectbrief.md`).

## Implementation Steps
1. **Setup**:
   - Initialize TypeORM with the entity definitions above and run migrations for SQLite.
   - Install dependencies: `pdf-parse`, `@vercel/ai-sdk`, `typeorm`, `reflect-metadata`, `sqlite3`.
2. **Backend**:
   - Implement `/pages/api/ai/career-advice.ts` and utility functions.
   - Secure endpoints with NextAuth.js middleware.
3. **Frontend**:
   - Build `AiInteractionForm.tsx` and `AdviceDisplay.tsx`.
   - Integrate with Zustand for state management.
4. **Testing**:
   - Write Jest tests for API endpoints and PDF parsing.
   - Use React Testing Library for UI components.
5. **Deployment**:
   - Update GitHub Actions for CI/CD to include SQLite setup.
   - Deploy to Vercel, ensuring environment variables for AI SDK and database are configured.

## Future Enhancements
- Support additional file formats (e.g., DOCX) for resumes.
- Allow users to edit past sessions for iterative coaching.
- Integrate with calendar APIs for automated check-in reminders.
- Enhance AI prompts with Story Circle methodology (`projectbrief.md`) for narrative-driven advice.

This design aligns with the project’s goals of user empowerment, gamification, and AI-driven self-service, using the specified tech stack and adhering to documented patterns and preferences.

## Differences Between Prisma and TypeORM

- **TypeORM** is an Object-Relational Mapper that uses decorators and entity classes to define database schemas and relationships, providing a more traditional ORM experience in TypeScript/JavaScript.
- **Prisma** uses a schema definition language and generates a client for database access, focusing on type safety and query optimization.
- TypeORM supports Active Record and Data Mapper patterns, while Prisma primarily uses a Data Mapper approach.
- TypeORM requires explicit entity classes and decorators, which can be more verbose but offer fine-grained control.
- Prisma's generated client offers a simpler API for CRUD operations but less flexibility in some advanced ORM features.
- For this project, TypeORM integrates well with the existing entity-based architecture and SQLite setup, providing robust support for migrations and relations.
