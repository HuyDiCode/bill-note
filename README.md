# Bill Note

A modern web application for managing bills, notes, and expenses with friends and groups.

## Technologies

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: shadcn/ui components
- **State Management**: React Context API
- **Authentication**: Supabase Auth

## Features

- **User Management**: Sign up, login, profile management
- **Notes**: Create, edit, and organize personal notes
- **Expenses**: Track expenses and split bills with friends
- **Groups**: Create groups to organize expenses with multiple people
- **Real-time Updates**: Changes sync across all connected clients
- **Dark/Light Mode**: Full theme support
- **Responsive Design**: Works on mobile, tablet, and desktop

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/bill-note.git
cd bill-note
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the migration files located in `supabase/migrations/` to set up your database schema
3. Enable Auth providers in Supabase dashboard

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and shared code
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
├── supabase/
│   └── migrations/      # Database migration scripts
└── .env.local          # Environment variables (create this)
```

## Development Workflow

1. Pull the latest changes
2. Create a new branch for your feature/fix
3. Make changes and test locally
4. Push changes and create a pull request

## Best Practices

- Use toast notifications for user feedback instead of console logs
- Handle errors gracefully with proper user messages
- Follow the Result pattern for error handling in API calls
- Keep components small and focused on a single responsibility
- Use proper TypeScript types for all components and functions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
