# Beyond the Keys - Management System

## Overview
A comprehensive bilingual (Hebrew RTL / English LTR) management platform for documents, writing, learning, and task management. Designed for iOS/iPad/iPhone with full offline support via LocalStorage.

## Current State
- **Status**: MVP Complete
- **Languages**: Hebrew (default, RTL), English (LTR)
- **Storage**: LocalStorage only (no server required)

## Features
1. **Dashboard** - Overview of tasks, documents, and learning progress
2. **Documents** - Create, edit, filter, and manage documents by type/language/tags
3. **Writing Studio** - Full-featured editor with auto-save and JSON export
4. **Learning Hub** - Course management with unit tracking and text-to-speech
5. **Internationalization** - Complete Hebrew/English support with RTL/LTR switching

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS with custom Beyond the Keys theming
- Shadcn/UI components
- LocalStorage for data persistence
- Web Speech API for text-to-speech

## Document Types
- BOOK, COURSE, DRAFT, STUDY, FOUNDATION, PROMPT, NOTE

## Task Types
- WRITING, TRANSLATION, LEARNING, TECH

## Task Statuses
- OPEN, IN_PROGRESS, DONE

## LocalStorage Keys
- `btk_documents` - Document storage
- `btk_courses` - Course storage
- `btk_tasks` - Task storage
- `btk_learning` - Learning progress
- `btk_language` - UI language preference

## Project Structure
```
client/src/
├── context/
│   └── AppContext.tsx      # Global state and i18n
├── components/
│   └── layout/
│       └── Layout.tsx      # Main layout with sidebar
├── pages/
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Documents.tsx       # Document list and filtering
│   ├── WritingStudio.tsx   # Document editor
│   └── LearningHub.tsx     # Course and unit management
└── App.tsx                 # Main app with routing
```

## Brand Colors
- Primary Background: #0B1220 (Deep Navy)
- Sidebar: #0F162A (Sidebar Navy)
- Gold Accent: #D4AF37
- Gold Hover: #b9972f

## Running the Project
```bash
npm run dev
```

## Recent Changes
- Initial MVP implementation with all core features
- Full bilingual support (Hebrew/English)
- LocalStorage persistence for offline use
- iOS-optimized responsive design
