# Active Context

## Current Work Focus

We're currently focused on:

1. Fixing and enhancing error handling throughout the application
2. Adding internationalization (i18n) support for Vietnamese and English
3. Creating standardized error messages and constants
4. Improving API routes with better error responses
5. Ensuring database tables are created with proper RLS policies

## Recent Changes

1. Fixed the "Failed to fetch notes" error by:

   - Enhancing error handling in API routes
   - Adding better error messages with translation support
   - Adding migration guidance to the codebase
   - Creating a troubleshooting section in the README

2. Implemented internationalization (i18n) support

   - Added support for Vietnamese and English languages
   - Created translated error messages
   - Updated components to use translation keys

3. Created constants for error messages

   - Added `constants/errors.ts` for centralized error codes
   - Implemented error message system with i18n support

4. Enhanced API route error handling
   - Improved error responses with consistent formats
   - Added checks for table existence before queries
   - Implemented proper error status codes

## Git Workflow and Commit Standards

### Commit Message Guidelines

All commit messages should:

1. Be written in English
2. Follow the Conventional Commits format
3. Have a clear and concise description of the changes
4. Reference issue numbers when applicable

#### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process, tooling, etc.

#### Examples

```
fix(api): Resolve "Failed to fetch notes" error
feat(i18n): Add Vietnamese translation for error messages
refactor(component): Extract NoteItem from NotesList for reusability
docs(readme): Update installation instructions
```

### README Modification Policy

The README file should only be updated when:

1. Project features change significantly
2. Installation instructions need updating
3. Important troubleshooting information needs to be added
4. Project structure or requirements change

**Do not edit the README for:**

- Minor code changes
- Bug fixes that don't affect user setup/installation
- Internal refactoring
- Changes that users don't need to be aware of

README is primarily for end users to understand the project, its features, and how to get started. Keep changes to this file purposeful and necessary.

## Next Steps

1. Complete the internationalization implementation
2. Enhance the receipt scanning feature with better AI integration
3. Improve data visualization for expense reports
4. Add collaboration features for shared expenses
5. Implement user profiles with preferences

## Active Decisions and Considerations

1. Using Supabase Auth with the latest SSR approach (@supabase/ssr package)
2. Implementing Row Level Security for data protection
3. Adding proper error handling with i18n support
4. Ensuring mobile-first responsive design
5. Following a component-based architecture with Shadcn UI

## Current Focus

The current focus of the project is establishing the foundational database structure and type system for the Bill Note application. We are working on developing a robust set of TypeScript types and enums that accurately represent the database schema, user interface states, and application constants.

Key features we are focusing on implementing:

1. **Basic Note Management**: Completing the functionality to create, read, update, and delete notes with detailed expense items.

2. **Expense Assignment Feature**: Allowing users to assign specific expense items to different collaborators, with automatic calculation of each person's share.

3. **Bill Image Extraction using Gemini API**: Implementing functionality to extract expense data from bill images uploaded by users, significantly reducing manual data entry.

4. **Collaboration Features**: Implementing invite functionality to allow users to share expense notes with friends.

## Active Decisions

1. **Type Organization**: We've decided to separate types into multiple files for better organization:

   - `database.ts` for database-related types
   - `enums.ts` for enumerated types
   - `constants.ts` for application constants
   - `state.ts` for state management types
   - `index.ts` for re-exporting all types

2. **Database Schema Design**: The database design focuses on:

   - Normalized structure to minimize redundancy
   - Proper relationships between entities
   - Support for collaborative features
   - Multi-currency expense tracking
   - Comprehensive tagging system
   - Expense assignment tracking (new addition)

3. **State Management Approach**: We're implementing a combined approach:

   - React Context for global state
   - React Query for server state
   - Local component state for UI-specific states
   - Strong typing for all state objects

4. **Authentication Implementation**: Using Supabase Auth with:

   - JWT-based authentication
   - Server-side rendering support
   - Row Level Security for data protection
   - Server-side validation of authentication state

5. **Expense Assignment Implementation**: We've decided to:

   - Create a new junction table `note_item_assignments` to track which users are assigned to each expense item
   - Add a new field to store assignment ratios/percentages when partial assignments are needed
   - Implement real-time notifications for new assignments
   - Create UI components for assigning items to collaborators
   - Add calculation utilities for determining each user's total share

6. **Gemini API Integration**: We've decided to:

   - Create a dedicated API endpoint to handle image uploads and Gemini API requests
   - Implement error handling and fallback mechanisms for failed extractions
   - Develop a UI to allow users to review and correct extracted data
   - Add support for different receipt formats (grocery, restaurant, etc.)
   - Store original receipt images in Supabase Storage for reference

7. **Implementation Sequence**:
   - Complete basic note management functionality first (create, read, update, delete)
   - Integrate Gemini API for bill image extraction
   - Implement collaboration features (invitations, sharing)
   - Add expense assignment functionality
   - Develop additional features (filtering, reporting, etc.)

## Key Considerations

1. **Type Safety**: Ensuring type safety throughout the application to catch errors at compile time rather than runtime.

2. **Performance**: Designing database schema and types to support efficient queries and minimize data transfer.

3. **Flexibility**: Creating a type system that can accommodate future features without major refactoring.

4. **Developer Experience**: Organizing types logically to improve code maintainability and development efficiency.

5. **Security**: Implementing proper authentication and authorization checks at both type and runtime levels.

6. **User Experience**: Making the expense assignment process intuitive and flexible, with clear notifications and summaries of who owes what.

7. **AI Integration**: Balancing automation with user control for bill image extraction, allowing users to review and correct AI interpretations.

## Open Questions

1. How should we handle real-time updates for collaborative note editing?
2. What's the best approach for optimistic updates to improve UX?
3. How do we efficiently implement filtering and sorting for notes?
4. What's the optimal strategy for handling image uploads for receipts?
5. How should we implement exportable reports for expense analysis?
6. What's the best UI pattern for assigning multiple people to a single expense item?
7. How should we handle assignment changes after initial creation?
8. What's the most efficient way to process and analyze receipt images with Gemini?
9. How should we handle cases where Gemini fails to extract data correctly?
10. What level of customization should we allow for extracted data before saving?
