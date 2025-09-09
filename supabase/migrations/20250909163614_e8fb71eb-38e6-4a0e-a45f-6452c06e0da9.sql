-- Create daily_statistics table
CREATE TABLE public.daily_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sdr_name TEXT NOT NULL,
  date DATE NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  connected_calls INTEGER NOT NULL DEFAULT 0,
  emails INTEGER NOT NULL DEFAULT 0,
  potential_appointments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per SDR per date
  UNIQUE(sdr_name, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same as other tables)
CREATE POLICY "Allow all operations on daily_statistics" 
ON public.daily_statistics 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_statistics_updated_at
BEFORE UPDATE ON public.daily_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();