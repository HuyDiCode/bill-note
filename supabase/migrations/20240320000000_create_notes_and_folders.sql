-- Create folders table
create table public.folders (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    parent_id uuid references public.folders(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notes table
create table public.notes (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text,
    user_id uuid references auth.users(id) on delete cascade not null,
    folder_id uuid references public.folders(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.folders enable row level security;
alter table public.notes enable row level security;

-- Create policies
create policy "Users can create their own folders"
    on public.folders for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own folders"
    on public.folders for select
    using (auth.uid() = user_id);

create policy "Users can update their own folders"
    on public.folders for update
    using (auth.uid() = user_id);

create policy "Users can delete their own folders"
    on public.folders for delete
    using (auth.uid() = user_id);

create policy "Users can create their own notes"
    on public.notes for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own notes"
    on public.notes for select
    using (auth.uid() = user_id);

create policy "Users can update their own notes"
    on public.notes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own notes"
    on public.notes for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_folders_updated_at
    before update on public.folders
    for each row
    execute function public.handle_updated_at();

create trigger handle_notes_updated_at
    before update on public.notes
    for each row
    execute function public.handle_updated_at(); 