-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  company TEXT,
  number TEXT,
  linkedin TEXT,
  country TEXT,
  scheduled_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  conducted BOOLEAN DEFAULT false,
  no_show BOOLEAN DEFAULT false,
  opportunity BOOLEAN DEFAULT false,
  notes TEXT,
  reschedule_comments TEXT,
  meeting_notes TEXT,
  sdr_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_statistics table
CREATE TABLE public.daily_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sdr_name TEXT NOT NULL,
  date DATE NOT NULL,
  calls INTEGER DEFAULT 0,
  connected_calls INTEGER DEFAULT 0,
  emails INTEGER DEFAULT 0,
  potential_appointments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (modify as needed for authentication)
CREATE POLICY "Allow public read access to appointments" 
ON public.appointments 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to appointments" 
ON public.appointments 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to appointments" 
ON public.appointments 
FOR DELETE 
USING (true);

CREATE POLICY "Allow public read access to daily_statistics" 
ON public.daily_statistics 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to daily_statistics" 
ON public.daily_statistics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to daily_statistics" 
ON public.daily_statistics 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to daily_statistics" 
ON public.daily_statistics 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_statistics_updated_at
BEFORE UPDATE ON public.daily_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();