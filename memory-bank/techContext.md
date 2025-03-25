# Technical Context

## Technology Stack

### Frontend

- **Framework**: Next.js (React framework)
- **Language**: TypeScript
- **UI Components**: Shadcn UI (built on Radix UI)
- **Data Fetching**: Tanstack Query (React Query)
- **State Management**: React Context API + React Hooks
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **Image Upload**: React Dropzone
- **Receipt Scanning**: Gemini API for image analysis

### Backend

- **Platform**: Supabase (Backend as a Service)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for receipt images
- **APIs**: Supabase REST and Realtime APIs
- **AI Integration**: Gemini API for receipt data extraction
- **Serverless Functions**: Next.js API Routes

### Development Tools

- **Package Manager**: npm/yarn
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git
- **Deployment**: Vercel (for Next.js frontend)
- **API Testing**: Postman/Insomnia

## Database Schema

The database follows a normalized structure with the following main tables:

1. **profiles** - User profile information
2. **notes** - Main expense notes
3. **note_items** - Individual items within a note
4. **note_item_assignments** - Assignments of expense items to specific users
5. **categories** - Expense categories
6. **stores** - Shopping locations
7. **note_collaborators** - Junction table for note sharing
8. **tags** - User-defined tags
9. **note_tags** - Junction table for note tagging
10. **notifications** - User notifications for expense assignments and other events
11. **receipts** - Stored information about uploaded receipt images

The schema includes appropriate foreign key relationships, constraints, and indexes for optimal performance. Special attention is given to the expense assignment system which allows users to assign specific items to multiple people, with support for partial assignments (e.g., assigning an item to 3 out of 5 collaborators).

## Image Processing and AI Integration

The application integrates with Gemini API for processing receipt images:

1. **Image Upload Flow**:

   - Images are uploaded via React Dropzone
   - Temporarily stored in browser memory
   - Sent to Next.js API endpoint
   - Processed by Gemini API
   - Results presented to user for confirmation
   - Images stored in Supabase Storage after confirmation

2. **Data Extraction Capabilities**:

   - Store name and location
   - Date and time of purchase
   - Individual items and prices
   - Tax amounts
   - Total amount
   - Payment methods

3. **Error Handling**:

   - Fallback for poor quality images
   - Manual override options
   - Confidence scores for extracted data
   - Suggestions for unrecognized items

4. **Storage**:
   - Original receipt images stored in Supabase Storage
   - Links between receipts and notes stored in database
   - Extracted data saved to note_items table

## Authentication & Authorization

- Supabase Auth is used for user authentication
- Authentication methods include email/password and OAuth providers
- Row Level Security (RLS) policies control data access
- Permission levels (view, edit, admin) for collaborative features

## API Structure

The application uses Supabase's client libraries for data access:

- REST API for CRUD operations
- Realtime subscriptions for collaborative features
- Server-side API calls for protected operations
- Client-side queries for user-specific data
- Custom API routes for Gemini integration

## Folder Structure

```
/
├── app/                  # Next.js app router
│   ├── (auth)/           # Authentication routes
│   ├── (root)/           # Main application routes
│   ├── api/              # API routes
│   │   └── gemini/       # Gemini API integration endpoints
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   ├── notes/            # Note-related components
│   ├── receipts/         # Receipt scanning components
│   ├── assignments/      # Expense assignment components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utility functions and shared logic
│   ├── supabase/         # Supabase client utilities
│   ├── gemini/           # Gemini API utilities
│   └── utils/            # General utilities
├── hooks/                # Custom React hooks
├── providers/            # Context providers
├── styles/               # Global styles
├── types/                # TypeScript type definitions
│   ├── database.ts       # Database interface types
│   ├── enums.ts          # Enumerated types
│   ├── constants.ts      # Application constants
│   ├── gemini.ts         # Gemini API response types
│   └── state.ts          # State management types
└── public/               # Static assets
```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-only operations)
- `GEMINI_API_KEY` - Google Gemini API key for AI image processing
- Additional environment variables for third-party services

## Deployment Strategy

- Frontend deployed on Vercel
- Database and backend services hosted on Supabase
- Continuous deployment from main branch
- Staging environment for testing

## Performance Considerations

- Server-side rendering for initial page loads
- Client-side rendering for dynamic content
- Caching strategies for frequently accessed data
- Pagination for large data sets
- Optimistic UI updates for better user experience
- Efficient image processing and storage

## Security Measures

- HTTPS for all communications
- Environment variables for sensitive information
- Row Level Security (RLS) for database access control
- Input validation on both client and server
- Content Security Policy (CSP) headers
- Rate limiting for API endpoints
- Secure handling of uploaded images

## Testing Strategy

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for key workflows
- End-to-end tests for critical user journeys
- Manual testing for usability and edge cases
- AI extraction accuracy testing
