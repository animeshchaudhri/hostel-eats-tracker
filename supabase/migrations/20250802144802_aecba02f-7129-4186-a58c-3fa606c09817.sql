-- Create users table for hostel students
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  login_code TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_entries table
CREATE TABLE public.meal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  dish_name TEXT NOT NULL,
  cost INTEGER NOT NULL, -- Store in paise/cents
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can update users" 
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can delete users" 
ON public.users 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create policies for meal_entries table
CREATE POLICY "Users can view all meal entries" 
ON public.meal_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert meal entries" 
ON public.meal_entries 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can update meal entries" 
ON public.meal_entries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can delete meal entries" 
ON public.meal_entries 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_entries_updated_at
BEFORE UPDATE ON public.meal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user
INSERT INTO public.users (name, room_number, login_code, is_admin) 
VALUES ('Admin', 'ADMIN', 'ADMIN123', true);

-- Insert sample users
INSERT INTO public.users (name, room_number, login_code, is_admin) 
VALUES 
  ('Animesh', 'C-806', 'ANIM001', false),
  ('Rahul', 'C-807', 'RAHU002', false),
  ('Priya', 'C-808', 'PRIY003', false);

-- Insert sample meal entries
INSERT INTO public.meal_entries (user_id, entry_date, meal_type, dish_name, cost) 
VALUES 
  ((SELECT id FROM public.users WHERE login_code = 'ANIM001'), '2025-01-31', 'breakfast', 'Aalu Paratha', 4500),
  ((SELECT id FROM public.users WHERE login_code = 'ANIM001'), '2025-01-31', 'lunch', 'Dal Rice', 8000),
  ((SELECT id FROM public.users WHERE login_code = 'ANIM001'), '2025-01-31', 'dinner', 'Chicken Curry', 12000),
  ((SELECT id FROM public.users WHERE login_code = 'ANIM001'), '2025-01-30', 'breakfast', 'Poha', 3500),
  ((SELECT id FROM public.users WHERE login_code = 'ANIM001'), '2025-01-30', 'lunch', 'Rajma Rice', 8500),
  ((SELECT id FROM public.users WHERE login_code = 'RAHU002'), '2025-01-31', 'breakfast', 'Bread Butter', 2500),
  ((SELECT id FROM public.users WHERE login_code = 'RAHU002'), '2025-01-31', 'lunch', 'Chole Bhature', 9500),
  ((SELECT id FROM public.users WHERE login_code = 'PRIY003'), '2025-01-31', 'breakfast', 'Idli Sambar', 4000),
  ((SELECT id FROM public.users WHERE login_code = 'PRIY003'), '2025-01-31', 'dinner', 'Paneer Butter Masala', 11000);