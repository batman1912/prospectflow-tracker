-- Create appointments table
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  number TEXT,
  linkedin TEXT,
  country TEXT,
  scheduled_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  conducted BOOLEAN DEFAULT false,
  no_show BOOLEAN DEFAULT false,
  opportunity BOOLEAN DEFAULT false,
  notes TEXT,
  reschedule_comments TEXT,
  meeting_notes TEXT,
  sdr_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create spiffs table
CREATE TABLE public.spiffs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  approved BOOLEAN DEFAULT false,
  date_announced DATE NOT NULL,
  announced_by TEXT NOT NULL,
  bdr_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  reason TEXT NOT NULL,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weekly_meetings table
CREATE TABLE public.weekly_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week TEXT NOT NULL,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  title TEXT,
  email TEXT NOT NULL,
  contact_no TEXT,
  assigned_to TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weekly_reports table for weekly summaries
CREATE TABLE public.weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week TEXT NOT NULL,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  scheduled_count INTEGER DEFAULT 0,
  conducted_count INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  companies_count INTEGER DEFAULT 0,
  week_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(week, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
CREATE POLICY "Allow all operations on appointments" ON public.appointments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on spiffs" ON public.spiffs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on weekly_meetings" ON public.weekly_meetings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on weekly_reports" ON public.weekly_reports
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spiffs_updated_at
  BEFORE UPDATE ON public.spiffs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_meetings_updated_at
  BEFORE UPDATE ON public.weekly_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at
  BEFORE UPDATE ON public.weekly_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_appointments_sdr_name ON public.appointments(sdr_name);
CREATE INDEX idx_appointments_scheduled_for ON public.appointments(scheduled_for);
CREATE INDEX idx_appointments_company ON public.appointments(company);
CREATE INDEX idx_spiffs_bdr_name ON public.spiffs(bdr_name);
CREATE INDEX idx_weekly_meetings_month_year ON public.weekly_meetings(month, year);
CREATE INDEX idx_weekly_reports_month_year ON public.weekly_reports(month, year);