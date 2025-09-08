import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, FileText, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WeeklyMeeting {
  id: string;
  week: string;
  month: string;
  year: string;
  firstName: string;
  lastName: string;
  companyName: string;
  title: string;
  email: string;
  contactNo: string;
  assignedTo: string;
  location: string;
}

export function WeeklyReports() {
  const [meetings, setMeetings] = useState<WeeklyMeeting[]>([
    {
      id: "1",
      week: "Week 1 (1-3rd Jan)",
      month: "January",
      year: "2025",
      firstName: "Manikant",
      lastName: "Ojha",
      companyName: "TechCorp Inc",
      title: "VP Sales",
      email: "manikant@techcorp.com",
      contactNo: "+1-555-0123",
      assignedTo: "John Smith (AE)",
      location: "New York, NY"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WeeklyMeeting>>({});
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2025");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setMeetings(prev => prev.map(meeting => 
        meeting.id === editingId ? { ...meeting, ...formData } as WeeklyMeeting : meeting
      ));
      toast({ title: "Meeting updated successfully" });
    } else {
      const newMeeting: WeeklyMeeting = {
        id: Date.now().toString(),
        week: formData.week || "",
        month: formData.month || selectedMonth,
        year: formData.year || selectedYear,
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        companyName: formData.companyName || "",
        title: formData.title || "",
        email: formData.email || "",
        contactNo: formData.contactNo || "",
        assignedTo: formData.assignedTo || "",
        location: formData.location || ""
      };
      setMeetings(prev => [...prev, newMeeting]);
      toast({ title: "Meeting added successfully" });
    }
    
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const openDialog = (meeting?: WeeklyMeeting) => {
    if (meeting) {
      setEditingId(meeting.id);
      setFormData(meeting);
    } else {
      setEditingId(null);
      setFormData({
        month: selectedMonth,
        year: selectedYear
      });
    }
    setIsDialogOpen(true);
  };

  const filteredMeetings = meetings.filter(meeting => 
    meeting.month === selectedMonth && meeting.year === selectedYear
  );

  const weekOptions = [
    "Week 1 (1-7th)",
    "Week 2 (8-14th)",
    "Week 3 (15-21st)",
    "Week 4 (22-28th)",
    "Week 5 (29-31st)"
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = ["2024", "2025", "2026"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Weekly Reports</h2>
          <p className="text-muted-foreground">Track weekly meeting schedules and assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Meeting" : "Add New Meeting"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select 
                    value={formData.month || selectedMonth} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select 
                    value={formData.year || selectedYear} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="week">Week</Label>
                  <Select 
                    value={formData.week || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, week: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekOptions.map(week => (
                        <SelectItem key={week} value={week}>{week}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
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
                  <Label htmlFor="contactNo">Contact Number</Label>
                  <Input
                    id="contactNo"
                    value={formData.contactNo || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned to (AE)</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  {editingId ? "Update" : "Add"} Meeting
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Controls */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Filter by Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="filterMonth">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterYear">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {selectedMonth} {selectedYear} - Weekly Meetings Scheduled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Assigned to (AE)</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No meetings scheduled for {selectedMonth} {selectedYear}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">{meeting.week}</TableCell>
                      <TableCell>
                        {meeting.firstName} {meeting.lastName}
                      </TableCell>
                      <TableCell>{meeting.companyName}</TableCell>
                      <TableCell>{meeting.title}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{meeting.email}</div>
                          <div className="text-sm text-muted-foreground">{meeting.contactNo}</div>
                        </div>
                      </TableCell>
                      <TableCell>{meeting.assignedTo}</TableCell>
                      <TableCell>{meeting.location}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(meeting)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}