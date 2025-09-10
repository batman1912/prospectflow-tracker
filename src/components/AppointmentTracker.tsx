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
import { Plus, Edit, Calendar, Phone, Mail, Globe, Upload, Trash, LayoutList, LayoutGrid } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData =
        data?.map((item) => ({
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          title: item.title || "",
          email: item.email,
          company: item.company,
          number: item.number || "",
          linkedin: item.linkedin || "",
          country: item.country || "",
          scheduledOn: item.scheduled_on
            ? new Date(item.scheduled_on).toISOString().split("T")[0]
            : "",
          scheduledFor: item.scheduled_for
            ? new Date(item.scheduled_for).toISOString().split("T")[0]
            : "",
          conducted: item.conducted || false,
          noShow: item.no_show || false,
          opportunity: item.opportunity || false,
          notes: item.notes || "",
          rescheduleComments: item.reschedule_comments || "",
          meetingNotes: item.meeting_notes || "",
          sdrName: item.sdr_name,
        })) || [];

      onAppointmentChange(transformedData);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast({
        title: "Error loading appointments",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("appointments")
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            title: formData.title,
            email: formData.email,
            company: formData.company,
            number: formData.number,
            linkedin: formData.linkedin,
            country: formData.country,
            scheduled_on: formData.scheduledOn
              ? new Date(formData.scheduledOn).toISOString()
              : null,
            scheduled_for: formData.scheduledFor
              ? new Date(formData.scheduledFor).toISOString()
              : new Date().toISOString(),
            conducted: formData.conducted || false,
            no_show: formData.noShow || false,
            opportunity: formData.opportunity || false,
            notes: formData.notes,
            reschedule_comments: formData.rescheduleComments,
            meeting_notes: formData.meetingNotes,
            sdr_name: formData.sdrName,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Appointment updated successfully" });
      } else {
        const { error } = await supabase.from("appointments").insert({
          first_name: formData.firstName || "",
          last_name: formData.lastName || "",
          title: formData.title,
          email: formData.email || "",
          company: formData.company || "",
          number: formData.number,
          linkedin: formData.linkedin,
          country: formData.country,
          scheduled_on: formData.scheduledOn
            ? new Date(formData.scheduledOn).toISOString()
            : new Date().toISOString(),
          scheduled_for: formData.scheduledFor
            ? new Date(formData.scheduledFor).toISOString()
            : new Date().toISOString(),
          conducted: formData.conducted || false,
          no_show: formData.noShow || false,
          opportunity: formData.opportunity || false,
          notes: formData.notes,
          reschedule_comments: formData.rescheduleComments,
          meeting_notes: formData.meetingNotes,
          sdr_name: formData.sdrName || "",
        });

        if (error) throw error;
        toast({ title: "Appointment added successfully" });
      }

      await loadAppointments();
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Error saving appointment",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("appointments").delete().eq("id", deleteId);
      if (error) throw error;

      toast({ title: "Appointment deleted successfully" });
      await loadAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Error deleting appointment",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Tracker</h2>
          <p className="text-muted-foreground">
            Manage prospect appointments and track opportunities
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Toggle View */}
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>

          {/* Add Appointment */}
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
              {/* form fields... same as your original code */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Appointment Views */}
      {viewMode === "list" ? (
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
                          <div className="font-medium">
                            {appointment.firstName} {appointment.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.title}
                          </div>
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
                                href={
                                  appointment.linkedin.startsWith("http")
                                    ? appointment.linkedin
                                    : `https://${appointment.linkedin}`
                                }
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
                      <TableCell>{appointment.sdrName || "Not Assigned"}</TableCell>
                      <TableCell>{appointment.scheduledFor}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              appointment.conducted
                                ? "default"
                                : appointment.noShow
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {appointment.conducted
                              ? "Conducted"
                              : appointment.noShow
                              ? "No Show"
                              : "Pending"}
                          </Badge>
                          {appointment.opportunity && (
                            <Badge variant="outline" className="text-success border-success">
                              Opportunity
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openDialog(appointment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setDeleteId(appointment.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="shadow-md">
              <CardHeader>
                <CardTitle>
                  {appointment.firstName} {appointment.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{appointment.title}</p>
                <p className="font-medium">{appointment.company}</p>
                <p className="text-sm">{appointment.email}</p>
                <p className="text-sm">{appointment.number}</p>
                <p className="text-sm">{appointment.country}</p>
                <div className="flex flex-col gap-1">
                  <Badge
                    variant={
                      appointment.conducted
                        ? "default"
                        : appointment.noShow
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {appointment.conducted
                      ? "Conducted"
                      : appointment.noShow
                      ? "No Show"
                      : "Pending"}
                  </Badge>
                  {appointment.opportunity && (
                    <Badge variant="outline" className="text-success border-success">
                      Opportunity
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(appointment)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => setDeleteId(appointment.id)}
                  >
                    <Trash className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this appointment? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
