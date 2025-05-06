# Architecture Overview

## 1. Overview

Sophera (formerly THRIVE) is a web application designed to assist cancer patients with research, treatment tracking, and care management. The application uses a modern stack with a React frontend and Node.js/Express backend, featuring AI capabilities for research assistance and medical document analysis.

The system is architected as a full-stack JavaScript/TypeScript application with clear separation between client and server components, coupled with advanced AI services integration for processing medical data and providing personalized assistance.

## 2. System Architecture

The application follows a client-server architecture with:

- **Frontend**: React-based single-page application with component-based UI
- **Backend**: Express.js API server with modular service-oriented architecture
- **Database**: PostgreSQL with Drizzle ORM for data management
- **AI Services**: Integration with multiple AI providers (OpenAI, Anthropic, Google) for different specialized tasks
- **Storage Services**: Document storage with vector embeddings for semantic search
- **Authentication**: Session-based authentication with JWT support

### High-Level Architecture Diagram

```
┌────────────────┐         ┌────────────────┐         ┌────────────────────┐
│                │         │                │         │                    │
│  React Client  │ ◄────► │  Express API   │ ◄────► │  PostgreSQL/Drizzle │
│                │         │                │         │                    │
└────────────────┘         └────────────────┘         └────────────────────┘
                                    ▲
                                    │
                                    ▼
                           ┌────────────────┐
                           │                │
                           │   AI Services  │
                           │                │
                           └────────────────┘
                                    ▲
                                    │
                                    ▼
                           ┌────────────────┐
                           │                │
                           │ Cloud Storage  │
                           │                │
                           └────────────────┘
```

## 3. Key Components

### 3.1 Frontend Architecture

The frontend is built with:

- **React**: Core UI library
- **TypeScript**: Type safety throughout the application
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: Component library based on Radix UI
- **React Query**: Data fetching, caching, and state management
- **React Hook Form**: Form handling with validation
- **Wouter**: Lightweight routing library

The client code is organized into:
- `/client/src/components`: Reusable UI components
- `/client/src/pages`: Page components that represent routes
- `/client/src/hooks`: Custom React hooks for shared logic
- `/client/src/lib`: Utility functions and configuration

### 3.2 Backend Architecture

The backend follows a service-oriented architecture with:

- **Express.js**: Web server framework
- **TypeScript**: Type safety for backend code
- **Drizzle ORM**: Database access and schema management
- **Zod**: Runtime schema validation
- **Multer**: File upload handling
- **Multiple AI Service Integrations**: OpenAI, Anthropic Claude, Google Gemini

The server code is organized into:
- `/server/services`: Specialized service modules (AI, documents, research, etc.)
- `/server/routes.ts`: API route definitions
- `/server/db.ts`: Database configuration
- `/server/storage.ts`: Storage interface and implementations

The backend implements the Repository pattern with a common storage interface that has multiple implementations (SQL DB and Firestore).

### 3.3 Database Schema

The application uses Drizzle ORM with PostgreSQL. Key entities include:

- **Users**: User profiles with medical diagnosis information
- **Documents**: Medical documents uploaded by users
- **ResearchItems**: Saved research information
- **Treatments**: Tracked treatments for patients
- **PlanItems**: Treatment plan and schedule items
- **JournalLogs**: Patient journal entries
- **DietLogs**: Nutrition and diet tracking
- **HopeSnippets**: Motivational content for emotional support

Schema definitions are centralized in `/shared/schema.ts` and used by both frontend and backend.

### 3.4 AI Services Architecture

The application implements a sophisticated AI router that dispatches queries to different AI models based on query type:

- **GPT (OpenAI)**: Medical term explanations, treatment details
- **Claude (Anthropic)**: Research analysis, alternative treatments, emotional support
- **Gemini (Google)**: General queries, creative exploration

The AI services are organized into specialized modules:
- `aiRouter.ts`: Central routing logic for AI queries
- `openai-service.ts`: OpenAI integration
- `anthropic-service.ts`: Claude integration
- `gemini-service.ts`: Google Gemini integration
- Specialized services for document analysis, OCR, medical terms, etc.

### 3.5 Document Processing Pipeline

The application includes a document processing pipeline for medical documents:

1. Upload via Multer middleware
2. OCR processing for images/PDFs via Tesseract.js
3. Content extraction and parsing
4. Medical term extraction and highlighting
5. Vector embedding generation for semantic search
6. Storage in database with metadata

## 4. Data Flow

### 4.1 Authentication Flow

1. User authenticates via session-based auth with JWT tokens
2. Sessions are stored in PostgreSQL sessions table
3. Authentication state is maintained on the client and verified on API requests

### 4.2 Research Assistant Flow

1. User submits a query via the chat interface
2. Backend determines query type (medical term, research, treatment, etc.)
3. Query is routed to appropriate AI service based on type
4. AI service generates response with source attribution
5. Response is returned to client and displayed in chat interface
6. User can save important information to their research items

### 4.3 Document Processing Flow

1. User uploads document (PDF, image, text)
2. Document is processed by the OCR service
3. Medical terms are extracted and highlighted
4. Document content is embedded for vector search
5. Processed document is saved with metadata
6. User can search and reference documents in research

## 5. External Dependencies

### 5.1 AI Service Providers

- **OpenAI API**: GPT models for medical term explanations and treatment details
- **Anthropic API**: Claude models for research analysis and emotional support
- **Google Generative AI**: Gemini models for general queries and multimodal inputs

### 5.2 Cloud Services

- **Neon Database**: PostgreSQL serverless database
- **Firestore**: Alternative document database (dual DB architecture)
- **Google Cloud Services**: Discovery Engine for search 

### 5.3 Document Processing

- **Tesseract.js**: OCR for extracting text from images
- **pdf-parse**: PDF text extraction
- **mammoth**: DOCX processing

## 6. Deployment Strategy

The application is configured for deployment on Replit with:

- **Build Process**: Vite for frontend, esbuild for backend
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Environment**: Production configuration with environment variables
- **Static Assets**: Served from `/dist/public` directory
- **API Server**: Runs on same domain to avoid CORS issues
- **Autoscaling**: Configured for Replit autoscaling deployment
- **Development Mode**: Custom development setup with hot reloading

### 6.1 Environment Configuration

- JWT and session secrets stored in environment variables
- Database connection string configured in environment
- AI API keys stored in environment variables
- Runtime environment determined by NODE_ENV

### 6.2 Development Workflow

- Local development with `npm run dev`
- TypeScript checking with `npm run check`
- Database schema updates with `npm run db:push`
- Build process for production with `npm run build`