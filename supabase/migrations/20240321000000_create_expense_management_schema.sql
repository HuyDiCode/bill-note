-- Drop existing tables if they exist
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS folders CASCADE;

-- Modify existing profiles table to match our new schema
ALTER TABLE IF EXISTS profiles
  DROP COLUMN IF EXISTS full_name,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  currency TEXT DEFAULT 'VND',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (group_id, user_id)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) NOT NULL,
  added_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  notes TEXT,
  store_name TEXT,
  category TEXT
);

-- Create expense_items table
CREATE TABLE IF NOT EXISTS expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  category TEXT
);

-- Create expense_shares table
CREATE TABLE IF NOT EXISTS expense_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_item_id UUID REFERENCES expense_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_to_pay NUMERIC(12,2) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  notes TEXT
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  token TEXT NOT NULL UNIQUE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) NOT NULL,
  payer_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_expense_id ON expense_items(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_shares_expense_item_id ON expense_shares(expense_item_id);
CREATE INDEX IF NOT EXISTS idx_expense_shares_user_id ON expense_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_shares_is_paid ON expense_shares(is_paid);
CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON transactions(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payer_id ON transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_id ON transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Create or replace functions
CREATE OR REPLACE FUNCTION get_group_members(group_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gm.user_id,
    u.email,
    p.name,
    p.avatar_url,
    gm.role,
    gm.joined_at
  FROM group_members gm
  JOIN auth.users u ON gm.user_id = u.id
  JOIN profiles p ON gm.user_id = p.id
  WHERE gm.group_id = $1 AND gm.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_balance(user_id UUID, group_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_owed NUMERIC;
  total_paid NUMERIC;
  balance NUMERIC;
BEGIN
  -- Calculate how much the user owes to others
  SELECT COALESCE(SUM(es.amount_to_pay), 0) INTO total_owed
  FROM expense_shares es
  JOIN expense_items ei ON es.expense_item_id = ei.id
  JOIN expenses e ON ei.expense_id = e.id
  WHERE es.user_id = $1 AND e.group_id = $2 AND es.is_paid = FALSE;
  
  -- Calculate how much others owe to the user
  SELECT COALESCE(SUM(es.amount_to_pay), 0) INTO total_paid
  FROM expense_shares es
  JOIN expense_items ei ON es.expense_item_id = ei.id
  JOIN expenses e ON ei.expense_id = e.id
  WHERE e.added_by = $1 AND e.group_id = $2 AND es.is_paid = FALSE AND es.user_id != $1;
  
  balance := total_paid - total_owed;
  RETURN balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_optimized_settlements(group_id UUID)
RETURNS TABLE (
  payer_id UUID,
  receiver_id UUID,
  amount NUMERIC
) AS $$
DECLARE
  balances RECORD;
  payers UUID[];
  receivers UUID[];
  payer_idx INTEGER;
  receiver_idx INTEGER;
  payer_balance NUMERIC;
  receiver_balance NUMERIC;
  transfer_amount NUMERIC;
BEGIN
  -- Create a temporary table to store user balances
  CREATE TEMP TABLE temp_balances (
    user_id UUID,
    balance NUMERIC
  ) ON COMMIT DROP;
  
  -- Calculate and store balances for all group members
  INSERT INTO temp_balances
  SELECT 
    gm.user_id,
    get_user_balance(gm.user_id, $1)
  FROM group_members gm
  WHERE gm.group_id = $1 AND gm.is_active = TRUE;
  
  -- Initialize arrays for payers (negative balance) and receivers (positive balance)
  SELECT array_agg(user_id) INTO payers FROM temp_balances WHERE balance < 0;
  SELECT array_agg(user_id) INTO receivers FROM temp_balances WHERE balance > 0;
  
  -- If either array is null, return empty result
  IF payers IS NULL OR receivers IS NULL THEN
    RETURN;
  END IF;
  
  payer_idx := 1;
  receiver_idx := 1;
  
  -- Process until all debts are settled
  WHILE payer_idx <= array_length(payers, 1) AND receiver_idx <= array_length(receivers, 1) LOOP
    -- Get current balances
    SELECT balance INTO payer_balance FROM temp_balances WHERE user_id = payers[payer_idx];
    SELECT balance INTO receiver_balance FROM temp_balances WHERE user_id = receivers[receiver_idx];
    
    -- Calculate transfer amount (minimum of absolute values)
    IF ABS(payer_balance) < receiver_balance THEN
      transfer_amount := ABS(payer_balance);
      -- Update balances
      UPDATE temp_balances SET balance = 0 WHERE user_id = payers[payer_idx];
      UPDATE temp_balances SET balance = balance - transfer_amount WHERE user_id = receivers[receiver_idx];
      -- Return result row
      payer_id := payers[payer_idx];
      receiver_id := receivers[receiver_idx];
      amount := transfer_amount;
      RETURN NEXT;
      -- Move to next payer
      payer_idx := payer_idx + 1;
    ELSE
      transfer_amount := receiver_balance;
      -- Update balances
      UPDATE temp_balances SET balance = balance + transfer_amount WHERE user_id = payers[payer_idx];
      UPDATE temp_balances SET balance = 0 WHERE user_id = receivers[receiver_idx];
      -- Return result row
      payer_id := payers[payer_idx];
      receiver_id := receivers[receiver_idx];
      amount := transfer_amount;
      RETURN NEXT;
      -- Move to next receiver
      receiver_idx := receiver_idx + 1;
    END IF;
  END LOOP;
  
  -- Clean up
  DROP TABLE temp_balances;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE OR REPLACE FUNCTION update_expense_total_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE expenses
  SET total_amount = (
    SELECT SUM(total_price)
    FROM expense_items
    WHERE expense_id = NEW.expense_id
  ),
  updated_at = now()
  WHERE id = NEW.expense_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_expense_total_after_item_change
AFTER INSERT OR UPDATE OR DELETE ON expense_items
FOR EACH ROW
EXECUTE FUNCTION update_expense_total_amount();

CREATE OR REPLACE FUNCTION update_expense_share_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE expense_shares
    SET is_paid = TRUE,
        paid_at = now()
    WHERE user_id = NEW.payer_id
    AND expense_item_id IN (
      SELECT ei.id
      FROM expense_items ei
      JOIN expenses e ON ei.expense_id = e.id
      WHERE e.group_id = NEW.group_id
      AND e.added_by = NEW.receiver_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_expense_shares_after_transaction
AFTER UPDATE ON transactions
FOR EACH ROW
WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
EXECUTE FUNCTION update_expense_share_status();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only view and edit their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = profiles.id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = profiles.id);

-- Groups: Only members can view group information
CREATE POLICY "Group members can view groups"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = TRUE
    )
  );

CREATE POLICY "Group admins can update groups"
  ON groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
      AND group_members.is_active = TRUE
    )
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Group members: Only group members can view other members
CREATE POLICY "Group members can view other members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.is_active = TRUE
    )
  );

CREATE POLICY "Group admins can manage members"
  ON group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND gm.is_active = TRUE
    )
  );

-- Expenses: Only group members can view and create expenses
CREATE POLICY "Group members can view expenses"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = TRUE
    )
  );

CREATE POLICY "Group members can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = TRUE
    )
    AND added_by = auth.uid()
  );

CREATE POLICY "Expense creators can update their expenses"
  ON expenses FOR UPDATE
  USING (added_by = auth.uid());

-- Expense items: Only group members can view and manage expense items
CREATE POLICY "Group members can view expense items"
  ON expense_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expense_items ei
      JOIN expenses e ON ei.expense_id = e.id
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE ei.id = expense_items.id
      AND gm.user_id = auth.uid()
      AND gm.is_active = TRUE
    )
  );

CREATE POLICY "Expense creators can manage expense items"
  ON expense_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM expense_items ei
      JOIN expenses e ON ei.expense_id = e.id
      WHERE ei.id = expense_items.id
      AND e.added_by = auth.uid()
    )
  );

-- Expense shares: Only relevant group members can view shares
CREATE POLICY "Group members can view expense shares"
  ON expense_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expense_shares es
      JOIN expense_items ei ON es.expense_item_id = ei.id
      JOIN expenses e ON ei.expense_id = e.id
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE es.id = expense_shares.id
      AND gm.user_id = auth.uid()
      AND gm.is_active = TRUE
    )
  );

CREATE POLICY "Expense creators can manage expense shares"
  ON expense_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM expense_shares es
      JOIN expense_items ei ON es.expense_item_id = ei.id
      JOIN expenses e ON ei.expense_id = e.id
      WHERE es.id = expense_shares.id
      AND e.added_by = auth.uid()
    )
  );

-- Invitations: Group members can view invitations for their groups
CREATE POLICY "Group members can view invitations"
  ON invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = invitations.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = TRUE
    )
  );

CREATE POLICY "Group admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = invitations.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
      AND group_members.is_active = TRUE
    )
    AND invited_by = auth.uid()
  );

-- Transactions: Group members can view transactions for their groups
CREATE POLICY "Group members can view transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = transactions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = TRUE
    )
  );

CREATE POLICY "Users can create transactions they are involved in"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = transactions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = TRUE
    )
    AND (payer_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "Users can update transactions they are involved in"
  ON transactions FOR UPDATE
  USING (payer_id = auth.uid() OR receiver_id = auth.uid()); 