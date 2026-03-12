import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { VehicleLogsTable } from '@/components/dashboard/VehicleLogsTable';
import { useParking } from '@/context/ParkingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter, Calendar, Car, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const VehicleHistory = () => {
  const { vehicleLogs } = useParking();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredLogs = useMemo(() => {
    return vehicleLogs.filter(log => {
      const matchesSearch = log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.slotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      let matchesDate = true;
      if (dateFrom) {
        matchesDate = new Date(log.entryTime) >= new Date(dateFrom);
      }
      if (dateTo && matchesDate) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        matchesDate = new Date(log.entryTime) <= toDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [vehicleLogs, searchTerm, statusFilter, dateFrom, dateTo]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Ticket ID', 'Vehicle Number', 'Vehicle Type', 'Slot', 'Entry Time', 'Exit Time', 'Duration (hrs)', 'Amount (₹)', 'Payment Method', 'Status'];
    const rows = filteredLogs.map(log => [
      log.ticketId || '',
      log.vehicleNumber,
      log.vehicleType || 'car',
      log.slotId,
      new Date(log.entryTime).toLocaleString('en-IN'),
      log.exitTime ? new Date(log.exitTime).toLocaleString('en-IN') : '-',
      log.duration ? log.duration.toFixed(2) : '-',
      log.amount?.toString() || '-',
      log.paymentMethod || '-',
      log.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Computed stats
  const totalRevenue = filteredLogs
    .filter(l => l.status === 'completed' && l.amount)
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const avgDuration = (() => {
    const completed = filteredLogs.filter(l => l.status === 'completed' && l.duration);
    if (completed.length === 0) return 0;
    return Math.round((completed.reduce((sum, l) => sum + (l.duration || 0), 0) / completed.length) * 10) / 10;
  })();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Vehicle <span className="gradient-text">History</span>
            </h1>
            <p className="text-muted-foreground">
              Complete log of all parking sessions
            </p>
          </div>
          <Button
            variant="heroOutline"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV ({filteredLogs.length})
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by vehicle number, slot, or ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="violation">Violation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range filter */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs"
              >
                Clear Dates
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredLogs.length}</div>
            <div className="text-xs text-muted-foreground">Total Records</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {filteredLogs.filter(l => l.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Car className="w-3 h-3" /> Active
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {filteredLogs.filter(l => l.status === 'completed').length}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" /> Completed
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" /> {avgDuration}h
            </div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredLogs.length} of {vehicleLogs.length} records
        </p>

        {filteredLogs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-1">No Records Found</h3>
            <p className="text-sm text-muted-foreground">
              {vehicleLogs.length === 0
                ? 'Start parking vehicles to see history here'
                : 'Try adjusting your search filters'}
            </p>
          </div>
        ) : (
          <VehicleLogsTable logs={filteredLogs} />
        )}
      </main>
    </div>
  );
};

export default VehicleHistory;
