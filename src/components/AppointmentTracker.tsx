import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Calendar, Phone, Mail, Globe, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  company: string;
  number: string;
  linkedin: string;
  country: string;
  scheduledOn: string;
  scheduledFor: string;
  conducted: boolean;
  noShow: boolean;
  opportunity: boolean;
  notes: string;
  rescheduleComments: string;
  meetingNotes: string;
  sdrName: string;
}

interface AppointmentTrackerProps {
  appointments: Appointment[];
  onAppointmentChange: (appointments: Appointment[]) => void;
}

export function AppointmentTracker({ appointments, onAppointmentChange }: AppointmentTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load appointments from Supabase on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to match component interface
      const transformedData = data?.map(item => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        title: item.title || '',
        email: item.email,
        company: item.company,
        number: item.number || '',
        linkedin: item.linkedin || '',
        country: item.country || '',
        scheduledOn: item.scheduled_on ? new Date(item.scheduled_on).toISOString().split('T')[0] : '',
        scheduledFor: item.scheduled_for ? new Date(item.scheduled_for).toISOString().split('T')[0] : '',
        conducted: item.conducted || false,
        noShow: item.no_show || false,
        opportunity: item.opportunity || false,
        notes: item.notes || '',
        rescheduleComments: item.reschedule_comments || '',
        meetingNotes: item.meeting_notes || '',
        sdrName: item.sdr_name
      })) || [];

      onAppointmentChange(transformedData);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({ 
        title: "Error loading appointments", 
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingId) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            title: formData.title,
            email: formData.email,
            company: formData.company,
            number: formData.number,
            linkedin: formData.linkedin,
            country: formData.country,
            scheduled_on: formData.scheduledOn ? new Date(formData.scheduledOn).toISOString() : null,
            scheduled_for: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : new Date().toISOString(),
            conducted: formData.conducted || false,
            no_show: formData.noShow || false,
            opportunity: formData.opportunity || false,
            notes: formData.notes,
            reschedule_comments: formData.rescheduleComments,
            meeting_notes: formData.meetingNotes,
            sdr_name: formData.sdrName
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Appointment updated successfully" });
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('appointments')
          .insert({
            first_name: formData.firstName || "",
            last_name: formData.lastName || "",
            title: formData.title,
            email: formData.email || "",
            company: formData.company || "",
            number: formData.number,
            linkedin: formData.linkedin,
            country: formData.country,
            scheduled_on: formData.scheduledOn ? new Date(formData.scheduledOn).toISOString() : new Date().toISOString(),
            scheduled_for: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : new Date().toISOString(),
            conducted: formData.conducted || false,
            no_show: formData.noShow || false,
            opportunity: formData.opportunity || false,
            notes: formData.notes,
            reschedule_comments: formData.rescheduleComments,
            meeting_notes: formData.meetingNotes,
            sdr_name: formData.sdrName || ""
          });

        if (error) throw error;
        toast({ title: "Appointment added successfully" });
      }
      
      // Reload appointments from database
      await loadAppointments();
      
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({ 
        title: "Error saving appointment", 
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingId(appointment.id);
      setFormData(appointment);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsDialogOpen(true);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const appointments = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        
        // Map CSV columns to our database structure
        const appointment = {
          first_name: values[headers.indexOf('First Name')] || '',
          last_name: values[headers.indexOf('Last Name')] || '',
          title: values[headers.indexOf('Title')] || '',
          email: values[headers.indexOf('Email')] || '',
          company: values[headers.indexOf('Company')] || '',
          number: values[headers.indexOf('Number')] || '',
          linkedin: values[headers.indexOf('LinkedIn')] || '',
          country: values[headers.indexOf('Country')] || '',
          scheduled_on: values[headers.indexOf('Appointment Scheduled on')] ? new Date(values[headers.indexOf('Appointment Scheduled on')]).toISOString() : new Date().toISOString(),
          scheduled_for: values[headers.indexOf('Appointment Scheduled for')] ? new Date(values[headers.indexOf('Appointment Scheduled for')]).toISOString() : new Date().toISOString(),
          conducted: values[headers.indexOf('Conducted')]?.toLowerCase() === 'true' || values[headers.indexOf('Conducted')]?.toLowerCase() === 'yes',
          no_show: false, // Default to false since not in CSV
          opportunity: values[headers.indexOf('Opportunity')]?.toLowerCase() === 'true' || values[headers.indexOf('Opportunity')]?.toLowerCase() === 'yes',
          notes: values[headers.indexOf('Notes')] || '',
          reschedule_comments: values[headers.indexOf('Reschedule Comments')] || '',
          meeting_notes: values[headers.indexOf('Meeting Notes')] || '',
          sdr_name: values[headers.indexOf('Account Executive')] || ''
        };
        
        appointments.push(appointment);
      }

      // Insert all appointments in batch
      const { error } = await supabase
        .from('appointments')
        .insert(appointments);

      if (error) throw error;

      toast({
        title: "CSV uploaded successfully",
        description: `Imported ${appointments.length} appointments`
      });

      // Reload appointments
      await loadAppointments();
      
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Error uploading CSV",
        description: "Please check the file format and try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Tracker</h2>
          <p className="text-muted-foreground">Manage prospect appointments and track opportunities</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
            id="csv-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('csv-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => openDialog()}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Appointment" : "Add New Appointment"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="number">Phone Number</Label>
                  <Input
                    id="number"
                    value={formData.number || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledOn">Scheduled On</Label>
                  <Input
                    id="scheduledOn"
                    type="date"
                    value={formData.scheduledOn || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledOn: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledFor">Scheduled For</Label>
                  <Input
                    id="scheduledFor"
                    type="date"
                    value={formData.scheduledFor || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sdrName">SDR Name</Label>
                  <Input
                    id="sdrName"
                    value={formData.sdrName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, sdrName: e.target.value }))}
                    placeholder="Enter SDR who booked this meeting"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="conducted">Conducted</Label>
                  <Select 
                    value={formData.conducted ? "true" : "false"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, conducted: value === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="noShow">No Show</Label>
                  <Select 
                    value={formData.noShow ? "true" : "false"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, noShow: value === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="opportunity">Opportunity</Label>
                  <Select 
                    value={formData.opportunity ? "true" : "false"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, opportunity: value === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="rescheduleComments">Reschedule Comments</Label>
                  <Textarea
                    id="rescheduleComments"
                    value={formData.rescheduleComments || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, rescheduleComments: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="meetingNotes">Meeting Notes</Label>
                  <Textarea
                    id="meetingNotes"
                    value={formData.meetingNotes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingNotes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-90" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update" : "Add"} Appointment
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Appointments Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>SDR</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.firstName} {appointment.lastName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{appointment.company}</div>
                      <div className="text-sm text-muted-foreground">{appointment.country}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {appointment.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {appointment.email}
                          </div>
                        )}
                        {appointment.number && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {appointment.number}
                          </div>
                        )}
                        {appointment.linkedin && (
  <div className="flex items-center gap-1 text-sm">
    <Globe className="w-3 h-3" />
    <a
      href={appointment.linkedin.startsWith("http") ? appointment.linkedin : `https://${appointment.linkedin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      LinkedIn
    </a>
  </div>
)}

                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{appointment.sdrName || "Not Assigned"}</div>
                    </TableCell>
                    <TableCell>{appointment.scheduledFor}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={appointment.conducted ? "default" : appointment.noShow ? "destructive" : "secondary"}>
                          {appointment.conducted ? "Conducted" : appointment.noShow ? "No Show" : "Pending"}
                        </Badge>
                        {appointment.opportunity && (
                          <Badge variant="outline" className="text-success border-success">
                            Opportunity
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
