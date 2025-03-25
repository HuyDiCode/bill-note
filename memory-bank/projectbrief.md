# Project Brief: Bill Note

## Project Overview

Bill Note is a personal finance application for tracking expenses and sharing financial notes with others. The app allows users to create detailed notes about their expenses, categorize them, collaborate with others, and gain insights into their spending habits.

## Core Requirements

### User Authentication & Profiles

- Secure authentication via Supabase Auth
- User profiles with personal information and preferences
- Default currency selection

### Note Management

- Create, read, update, and delete expense notes
- Add detailed items to each note with quantities and prices
- Categorize notes and items
- Tag notes for better organization
- Mark notes as favorite or archive them
- Share notes with other users with different permission levels
- Assign expense items to specific collaborators with flexible sharing options

### AI-Powered Bill Scanning

- Extract itemized expense data from bill images using Gemini API
- Automatically populate notes with detected store, date, items, and prices
- Support for various receipt formats (grocery, restaurant, utility bills)
- High accuracy text and number extraction
- User review interface for extracted data
- Confidence scoring for extracted elements
- Support for multiple languages on receipts

### Expense Assignment

- Assign specific expense items to individual collaborators
- Support partial assignments (e.g., assign an item to 3 out of 5 people)
- Automatically calculate each person's share of expenses
- Notify users when they are assigned expenses
- Track payment status of assigned expenses
- Provide summary views of who owes what

### Data Organization

- Store management (save frequent shopping locations)
- Category management with icons and colors
- Tag system for flexible organization
- Multi-currency support

### User Interface

- Responsive design for mobile and desktop
- Dark/light theme support
- Sorting and filtering options
- Multiple view modes (list, grid, calendar)

## Technical Requirements

### Frontend

- Next.js for the React framework
- TypeScript for type safety
- Shadcn UI components for consistent design
- Tanstack Query for data fetching and caching
- React Dropzone for image uploads

### Backend

- Supabase for authentication, database, and storage
- PostgreSQL database with proper schema design
- Row Level Security (RLS) policies for data protection
- Triggers for automatic calculations
- Real-time notifications for expense assignments
- Gemini API integration for receipt data extraction
- Next.js API Routes for server-side processing

### Architecture

- Server-side rendering where appropriate
- Type-safe database interactions
- Proper state management
- Modular component design
- Secure API integrations

## Non-functional Requirements

- Fast performance even with large datasets
- Secure data handling
- Intuitive user experience
- Consistent error handling
- Data integrity through proper validation
- High accuracy in receipt data extraction
- Efficient image processing pipeline
