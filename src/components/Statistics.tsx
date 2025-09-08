import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, BarChart3, TrendingUp, Phone, Mail, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DailyStats {
  id: string;
  sdrName: string;
  date: string;
  calls: number;
  connected: number;
  emails: number;
  potentialAppt: number;
}

export function Statistics() {
  const [stats, setStats] = useState<DailyStats[]>([
    {
      id: "1",
      sdrName: "Ashar",
      date: "2024-09-23",
      calls: 120,
      connected: 61,
      emails: 22,
      potentialAppt: 12
    },
    {
      id: "2",
      sdrName: "Muhammad Hassan",
      date: "2024-09-23",
      calls: 136,
      connected: 31,
      emails: 24,
      potentialAppt: 6
    },
    {
      id: "3",
      sdrName: "Ashar",
      date: "2024-09-24",
      calls: 126,
      connected: 32,
      emails: 0,
      potentialAppt: 0
    },
    {
      id: "4",
      sdrName: "Muhammad Hassan",
      date: "2024-09-24",
      calls: 137,
      connected: 42,
      emails: 7,
      potentialAppt: 1
    },
    {
      id: "5",
      sdrName: "Ashar",
      date: "2024-09-25",
      calls: 123,
      connected: 43,
      emails: 0,
      potentialAppt: 0
    },
    {
      id: "6",
      sdrName: "Muhammad Hassan",
      date: "2024-09-25",
      calls: 87,
      connected: 0,
      emails: 30,
      potentialAppt: 0
    },
    {
      id: "7",
      sdrName: "Ashar",
      date: "2024-09-26",
      calls: 45,
      connected: 11,
      emails: 20,
      potentialAppt: 52
    },
    {
      id: "8",
      sdrName: "Muhammad Hassan",
      date: "2024-09-26",
      calls: 0,
      connected: 29,
      emails: 0,
      potentialAppt: 2
    },
    {
      id: "9",
      sdrName: "Ashar",
      date: "2024-09-27",
      calls: 124,
      connected: 21,
      emails: 29,
      potentialAppt: 0
    },
    {
      id: "10",
      sdrName: "Muhammad Hassan",
      date: "2024-09-27",
      calls: 246,
      connected: 0,
      emails: 60,
      potentialAppt: 0
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DailyStats>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setStats(prev => prev.map(stat => 
        stat.id === editingId ? { ...stat, ...formData } as DailyStats : stat
      ));
      toast({ title: "Statistics updated successfully" });
    } else {
      const newStat: DailyStats = {
        id: Date.now().toString(),
        sdrName: formData.sdrName || "",
        date: formData.date || "",
        calls: formData.calls || 0,
        connected: formData.connected || 0,
        emails: formData.emails || 0,
        potentialAppt: formData.potentialAppt || 0
      };
      setStats(prev => [...prev, newStat]);
      toast({ title: "Statistics added successfully" });
    }
    
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const openDialog = (stat?: DailyStats) => {
    if (stat) {
      setEditingId(stat.id);
      setFormData(stat);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsDialogOpen(true);
  };

  // Calculate summary statistics
  const totalCalls = stats.reduce((sum, stat) => sum + stat.calls, 0);
  const totalConnected = stats.reduce((sum, stat) => sum + stat.connected, 0);
  const totalEmails = stats.reduce((sum, stat) => sum + stat.emails, 0);
  const totalPotentialAppt = stats.reduce((sum, stat) => sum + stat.potentialAppt, 0);
  const connectionRate = totalCalls > 0 ? ((totalConnected / totalCalls) * 100).toFixed(1) : "0";

  // Group stats by SDR
  const sdrStats = stats.reduce((acc, stat) => {
    if (!acc[stat.sdrName]) {
      acc[stat.sdrName] = {
        calls: 0,
        connected: 0,
        emails: 0,
        potentialAppt: 0
      };
    }
    acc[stat.sdrName].calls += stat.calls;
    acc[stat.sdrName].connected += stat.connected;
    acc[stat.sdrName].emails += stat.emails;
    acc[stat.sdrName].potentialAppt += stat.potentialAppt;
    return acc;
  }, {} as Record<string, { calls: number; connected: number; emails: number; potentialAppt: number }>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Statistics Dashboard</h2>
          <p className="text-muted-foreground">Track daily performance metrics and KPIs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Daily Stats
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Daily Stats" : "Add Daily Stats"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sdrName">SDR Name</Label>
                  <Input
                    id="sdrName"
                    value={formData.sdrName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, sdrName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="calls">Calls</Label>
                  <Input
                    id="calls"
                    type="number"
                    value={formData.calls || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, calls: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="connected">Connected</Label>
                  <Input
                    id="connected"
                    type="number"
                    value={formData.connected || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, connected: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emails">Emails</Label>
                  <Input
                    id="emails"
                    type="number"
                    value={formData.emails || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, emails: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="potentialAppt">Potential Appointments</Label>
                  <Input
                    id="potentialAppt"
                    type="number"
                    value={formData.potentialAppt || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, potentialAppt: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  {editingId ? "Update" : "Add"} Statistics
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalConnected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{connectionRate}% connection rate</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalEmails.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalPotentialAppt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* SDR Performance Summary */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            SDR Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SDR Name</TableHead>
                  <TableHead>Total Calls</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead>Connection Rate</TableHead>
                  <TableHead>Emails</TableHead>
                  <TableHead>Potential Appt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(sdrStats).map(([sdrName, data]) => {
                  const connectionRate = data.calls > 0 ? ((data.connected / data.calls) * 100).toFixed(1) : "0";
                  return (
                    <TableRow key={sdrName}>
                      <TableCell className="font-medium">{sdrName}</TableCell>
                      <TableCell>{data.calls.toLocaleString()}</TableCell>
                      <TableCell>{data.connected.toLocaleString()}</TableCell>
                      <TableCell>{connectionRate}%</TableCell>
                      <TableCell>{data.emails.toLocaleString()}</TableCell>
                      <TableCell>{data.potentialAppt.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Performance Details */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Daily Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>SDR Name</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead>Emails</TableHead>
                  <TableHead>Potential Appt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell>{new Date(stat.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{stat.sdrName}</TableCell>
                    <TableCell>{stat.calls}</TableCell>
                    <TableCell>{stat.connected}</TableCell>
                    <TableCell>{stat.emails}</TableCell>
                    <TableCell>{stat.potentialAppt}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(stat)}
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