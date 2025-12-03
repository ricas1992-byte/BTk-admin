# BTK Admin – Beyond the Keys Management System

BTK Admin is a web-based admin and learning management interface
for the **"Beyond the Keys (BTK)"** project.

It is used to manage Hebrew, RTL-oriented learning content:
courses, modules, and learning materials such as documents, audio, and video.

## Features

- Course management (create, edit, delete)
- Module management per course
- Uploading and organizing learning files (DOCX, PDF, audio, video)
- Hebrew Right-to-Left (RTL) user interface for learners and admins
- Simple dashboard for viewing and controlling BTK learning content
- Rich text editing with TipTap editor

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui components
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Drizzle ORM (Neon serverless)
- **Additional:** Firebase integration, Framer Motion animations, TipTap rich text editor

## Getting Started (in Replit)

1. Open this project in Replit.
2. Click the **Run** button.
3. Open the Webview URL that Replit shows to access the app.

## Development Workflow

- Make changes in Replit.
- To save your work to GitHub, type in the Agent chat:
  **"שמור לגיט"**
- To sync from GitHub into Replit, type:
  **"משוך מגיט"**
- To check Git status, type:
  **"בדוק גיט"**

## Project Structure

```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared types and schemas
├── attached_assets/ # Static assets
└── script/          # Build scripts
```

## License

MIT
