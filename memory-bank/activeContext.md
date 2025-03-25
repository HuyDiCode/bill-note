# Active Context

## Current Focus

The current focus of the project is establishing the foundational database structure and type system for the Bill Note application. We are working on developing a robust set of TypeScript types and enums that accurately represent the database schema, user interface states, and application constants.

Key features we are focusing on implementing:

1. **Basic Note Management**: Completing the functionality to create, read, update, and delete notes with detailed expense items.

2. **Expense Assignment Feature**: Allowing users to assign specific expense items to different collaborators, with automatic calculation of each person's share.

3. **Bill Image Extraction using Gemini API**: Implementing functionality to extract expense data from bill images uploaded by users, significantly reducing manual data entry.

4. **Collaboration Features**: Implementing invite functionality to allow users to share expense notes with friends.

## Recent Changes

- Created a comprehensive set of TypeScript types for database entities:

  - Types for all database tables (profiles, notes, note_items, categories, stores, tags, etc.)
  - Interface definitions with appropriate relationships
  - Type utilities for insert and update operations

- Defined enum types to ensure consistent data values:

  - NoteCategory: Categories for expense notes
  - CurrencyCode: Supported currencies
  - CollaboratorPermission: Permission levels for shared notes
  - NoteStatus: Status flags for notes
  - Various UI-related enums (AppTheme, NotificationTypes, etc.)

- Established constant values and utility functions:

  - Application configuration settings
  - Route definitions
  - Default category and currency data
  - Helper functions like formatCurrency()

- Created state management types:

  - Interface definitions for all state slices
  - Type definitions for component props and form states
  - Root state interface for global state management

- Identified need for expense assignment feature:

  - Ability to assign expense items to specific collaborators
  - Support for partial assignments (e.g., assign an item to 3/5 people)
  - Automatic calculation of each person's share
  - Notification system for expense assignments

- Added plan for Gemini API integration:
  - Extract itemized expense data from bill images
  - Automatic population of expense note with extracted data
  - Support for different receipt formats and languages
  - Error handling for low-quality images or unrecognized formats

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

## Next Steps

1. Implement basic note management functionality (create, read, update, delete)
2. Set up Gemini API integration for bill image extraction
3. Create UI components for image upload and extracted data review
4. Implement collaboration features (invitations and sharing)
5. Develop expense assignment functionality
6. Add filtering and reporting features
7. Enhance the user interface and experience

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
