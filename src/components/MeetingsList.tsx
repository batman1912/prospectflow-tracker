import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Phone, Mail, Globe, Search, Filter } from "lucide-react";

interface Meeting {
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

interface MeetingsListProps {
  meetings: Meeting[];
}

export function MeetingsList({ meetings }: MeetingsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sdrFilter, setSdrFilter] = useState("all");

  // Get unique SDR names for filter
  const uniqueSDRs = Array.from(new Set(meetings.map(m => m.sdrName).filter(Boolean)));

  // Filter meetings based on search and filters
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = !searchTerm || 
      `${meeting.firstName} ${meeting.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "conducted" && meeting.conducted) ||
      (statusFilter === "no-show" && meeting.noShow) ||
      (statusFilter === "pending" && !meeting.conducted && !meeting.noShow);

    const matchesSDR = sdrFilter === "all" || meeting.sdrName === sdrFilter;

    return matchesSearch && matchesStatus && matchesSDR;
  });

  const getStatusBadge = (meeting: Meeting) => {
    if (meeting.conducted) {
      return <Badge className="bg-success text-success-foreground">Conducted</Badge>;
    }
    if (meeting.noShow) {
      return <Badge variant="destructive">No Show</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getStatusStats = () => {
    const total = meetings.length;
    const conducted = meetings.filter(m => m.conducted).length;
    const noShows = meetings.filter(m => m.noShow).length;
    const pending = meetings.filter(m => !m.conducted && !m.noShow).length;
    const opportunities = meetings.filter(m => m.opportunity).length;

    return { total, conducted, noShows, pending, opportunities };
  };

  const stats = getStatusStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Meetings List</h2>
        <p className="text-muted-foreground">Comprehensive view of all scheduled meetings and their status</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Meetings</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{stats.conducted}</div>
            <p className="text-xs text-muted-foreground">Conducted</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{stats.noShows}</div>
            <p className="text-xs text-muted-foreground">No Shows</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">{stats.opportunities}</div>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="conducted">Conducted</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sdr">SDR</Label>
              <Select value={sdrFilter} onValueChange={setSdrFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SDRs</SelectItem>
                  {uniqueSDRs.map(sdr => (
                    <SelectItem key={sdr} value={sdr}>{sdr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            All Meetings ({filteredMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prospect</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>SDR</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No meetings found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{meeting.firstName} {meeting.lastName}</div>
                          <div className="text-sm text-muted-foreground">{meeting.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{meeting.company}</div>
                        <div className="text-sm text-muted-foreground">{meeting.country}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {meeting.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {meeting.email}
                            </div>
                          )}
                          {meeting.number && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {meeting.number}
                            </div>
                          )}
                          {meeting.linkedin && (
                            <div className="flex items-center gap-1 text-sm">
                              <Globe className="w-3 h-3" />
                              LinkedIn
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{meeting.sdrName || "Not Assigned"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{new Date(meeting.scheduledFor).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Booked: {new Date(meeting.scheduledOn).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(meeting)}
                          {meeting.opportunity && (
                            <Badge variant="outline" className="text-primary border-primary">
                              Opportunity
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {meeting.meetingNotes && (
                            <div className="text-sm mb-1">
                              <strong>Meeting:</strong> {meeting.meetingNotes}
                            </div>
                          )}
                          {meeting.notes && (
                            <div className="text-sm mb-1">
                              <strong>Notes:</strong> {meeting.notes}
                            </div>
                          )}
                          {meeting.rescheduleComments && (
                            <div className="text-sm text-warning">
                              <strong>Reschedule:</strong> {meeting.rescheduleComments}
                            </div>
                          )}
                        </div>
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