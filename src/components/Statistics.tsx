import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, BarChart3, TrendingUp, Phone, Mail, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DailyStats {
  id: string;
  sdr_name: string;
  date: string;
  calls: number;
  connected_calls: number;
  emails: number;
  potential_appointments: number;
}

export function Statistics() {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DailyStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_statistics')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast({
        title: "Error loading statistics",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('daily_statistics')
          .update({
            sdr_name: formData.sdr_name!,
            date: formData.date!,
            calls: formData.calls!,
            connected_calls: formData.connected_calls!,
            emails: formData.emails!,
            potential_appointments: formData.potential_appointments!,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Statistics updated successfully" });
      } else {
        const { error } = await supabase
          .from('daily_statistics')
          .insert([{
            sdr_name: formData.sdr_name!,
            date: formData.date!,
            calls: formData.calls || 0,
            connected_calls: formData.connected_calls || 0,
            emails: formData.emails || 0,
            potential_appointments: formData.potential_appointments || 0,
          }]);

        if (error) throw error;
        toast({ title: "Statistics added successfully" });
      }
      
      await loadStats();
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving statistics:', error);
      toast({
        title: "Error saving statistics",
        description: "Please try again later",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return <div className="p-6">Loading statistics...</div>;
  }

  // Calculate summary statistics
  const totalCalls = stats.reduce((sum, stat) => sum + stat.calls, 0);
  const totalConnected = stats.reduce((sum, stat) => sum + stat.connected_calls, 0);
  const totalEmails = stats.reduce((sum, stat) => sum + stat.emails, 0);
  const totalPotentialAppt = stats.reduce((sum, stat) => sum + stat.potential_appointments, 0);
  const connectionRate = totalCalls > 0 ? ((totalConnected / totalCalls) * 100).toFixed(1) : "0";

  // Group stats by SDR
  const sdrStats = stats.reduce((acc, stat) => {
    if (!acc[stat.sdr_name]) {
      acc[stat.sdr_name] = {
        calls: 0,
        connected: 0,
        emails: 0,
        potentialAppt: 0
      };
    }
    acc[stat.sdr_name].calls += stat.calls;
    acc[stat.sdr_name].connected += stat.connected_calls;
    acc[stat.sdr_name].emails += stat.emails;
    acc[stat.sdr_name].potentialAppt += stat.potential_appointments;
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
                  <Label htmlFor="sdr_name">SDR Name</Label>
                  <Input
                    id="sdr_name"
                    value={formData.sdr_name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, sdr_name: e.target.value }))}
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
                  <Label htmlFor="connected_calls">Connected</Label>
                  <Input
                    id="connected_calls"
                    type="number"
                    value={formData.connected_calls || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, connected_calls: parseInt(e.target.value) || 0 }))}
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
                  <Label htmlFor="potential_appointments">Potential Appointments</Label>
                  <Input
                    id="potential_appointments"
                    type="number"
                    value={formData.potential_appointments || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, potential_appointments: parseInt(e.target.value) || 0 }))}
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
                {stats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell>{new Date(stat.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{stat.sdr_name}</TableCell>
                    <TableCell>{stat.calls}</TableCell>
                    <TableCell>{stat.connected_calls}</TableCell>
                    <TableCell>{stat.emails}</TableCell>
                    <TableCell>{stat.potential_appointments}</TableCell>
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