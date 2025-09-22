# replit.md

## Overview

VNShare is a group expense tracking application built with a modern full-stack architecture. The system allows users to create expense folders, manage group members, track expenses, and automatically calculate balances between members. It features a clean, responsive UI for managing shared expenses with support for equal and custom splits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with conventional HTTP methods
- **Request Processing**: JSON request/response handling with express middleware
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development**: Hot reloading via Vite integration in development mode

### Data Storage Solutions
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling via @neondatabase/serverless with WebSocket support
- **Schema Design**: Relational design with users, folders, members, expenses, and expense shares tables

### Authentication and Authorization
- **Current State**: Demo implementation with hardcoded user ID
- **Session Management**: Connect-pg-simple for PostgreSQL-based session storage (configured but not actively used)
- **Security**: Prepared for future authentication implementation

### Data Architecture
- **Shared Types**: Common schema definitions between client and server using Zod
- **Validation**: Runtime type validation with Zod schemas for API inputs
- **Type Safety**: End-to-end TypeScript with shared type definitions
- **Database Relations**: Drizzle relations for handling foreign keys and joins

### Project Structure
- **Monorepo Setup**: Client, server, and shared code in single repository
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/, @assets/)
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)
- **Development Workflow**: Unified development server with API and client served together

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Environment Configuration**: DATABASE_URL environment variable required

### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire application
- **Replit Plugins**: Integration with Replit development environment

### Form and Data Management
- **React Hook Form**: Performant form library with minimal re-renders
- **TanStack Query**: Powerful data synchronization for React
- **Date-fns**: Modern JavaScript date utility library
- **Class Variance Authority**: Utility for creating component variants

### Additional Libraries
- **Wouter**: Lightweight routing for React applications
- **CMDK**: Command menu component for search interfaces
- **Embla Carousel**: Lightweight carousel library for React