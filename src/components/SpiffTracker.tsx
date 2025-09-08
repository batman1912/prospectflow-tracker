import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Spiff {
  id: string;
  approved: boolean;
  dateAnnounced: string;
  announcedBy: string;
  bdrName: string;
  amount: number;
  currency: string;
  reason: string;
  additionalNotes: string;
}

export function SpiffTracker() {
  const [spiffs, setSpiffs] = useState<Spiff[]>([
    {
      id: "1",
      approved: true,
      dateAnnounced: "2024-01-15",
      announcedBy: "Sarah Johnson",
      bdrName: "Manikant Ojha",
      amount: 500,
      currency: "USD",
      reason: "Q4 Target Achievement",
      additionalNotes: "Exceeded quarterly quota by 120%"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Spiff>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setSpiffs(prev => prev.map(spiff => 
        spiff.id === editingId ? { ...spiff, ...formData } as Spiff : spiff
      ));
      toast({ title: "SPIFF updated successfully" });
    } else {
      const newSpiff: Spiff = {
        id: Date.now().toString(),
        approved: formData.approved || false,
        dateAnnounced: formData.dateAnnounced || "",
        announcedBy: formData.announcedBy || "",
        bdrName: formData.bdrName || "",
        amount: formData.amount || 0,
        currency: formData.currency || "USD",
        reason: formData.reason || "",
        additionalNotes: formData.additionalNotes || ""
      };
      setSpiffs(prev => [...prev, newSpiff]);
      toast({ title: "SPIFF added successfully" });
    }
    
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const openDialog = (spiff?: Spiff) => {
    if (spiff) {
      setEditingId(spiff.id);
      setFormData(spiff);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsDialogOpen(true);
  };

  const totalApproved = spiffs.filter(s => s.approved).reduce((sum, s) => sum + s.amount, 0);
  const totalPending = spiffs.filter(s => !s.approved).reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">SPIFF Tracker</h2>
          <p className="text-muted-foreground">Track sales incentives and bonuses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add SPIFF
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit SPIFF" : "Add New SPIFF"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approved">Status</Label>
                  <Select 
                    value={formData.approved ? "true" : "false"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, approved: value === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Pending</SelectItem>
                      <SelectItem value="true">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateAnnounced">Date Announced</Label>
                  <Input
                    id="dateAnnounced"
                    type="date"
                    value={formData.dateAnnounced || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateAnnounced: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="announcedBy">Announced By</Label>
                  <Input
                    id="announcedBy"
                    value={formData.announcedBy || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, announcedBy: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bdrName">BDR Name</Label>
                  <Input
                    id="bdrName"
                    value={formData.bdrName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, bdrName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency || "USD"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={formData.reason || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  {editingId ? "Update" : "Add"} SPIFF
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalApproved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {spiffs.filter(s => s.approved).length} approved SPIFFs
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {spiffs.filter(s => !s.approved).length} pending SPIFFs
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SPIFFs</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{spiffs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            SPIFF Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BDR Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date Announced</TableHead>
                  <TableHead>Announced By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spiffs.map((spiff) => (
                  <TableRow key={spiff.id}>
                    <TableCell className="font-medium">{spiff.bdrName}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {spiff.currency} ${spiff.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{spiff.reason}</div>
                      {spiff.additionalNotes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {spiff.additionalNotes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{spiff.dateAnnounced}</TableCell>
                    <TableCell>{spiff.announcedBy}</TableCell>
                    <TableCell>
                      <Badge variant={spiff.approved ? "default" : "secondary"}>
                        {spiff.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(spiff)}
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