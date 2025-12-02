# Beyond the Keys - Management System

## Overview
A comprehensive multilingual management platform for documents, writing, learning, and task management. Designed for iOS/iPad/iPhone with full offline support via LocalStorage.

## Current State
- **Status**: MVP Complete with Advanced Features
- **Languages**: 6 languages supported - Hebrew (default, RTL), Arabic (RTL), English, Russian, Spanish, French (all LTR)
- **Storage**: LocalStorage only (no server required)

## Features
1. **Dashboard** - Overview of tasks, documents, and learning progress
2. **Documents** - Create, edit, filter, and manage documents by type/language/tags
3. **Writing Studio** - Full-featured TipTap rich text editor with formatting (bold, italic, underline, headings, lists, alignment, code blocks), auto-save and JSON export
4. **Learning Hub** - Course management with unit tracking, text-to-speech, and advanced analytics with visual charts
5. **Settings** - Data backup system (export/import/clear) with validation
6. **Internationalization** - Complete 6-language support with proper RTL/LTR direction handling

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
- Full 6-language support (Hebrew, English, Russian, Arabic, Spanish, French)
- LocalStorage persistence for offline use
- iOS-optimized responsive design
- TipTap rich text editor with full formatting capabilities
- Learning Analytics with visual progress charts (pie chart, bar chart)
- Data backup system with export/import/clear functionality
