import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, TrendingUp, Circle, Clock, CheckCircle2 } from "lucide-react";
import { ProtocolCard } from "./ProtocolCard";
import { SessionLogModal } from "./SessionLogModal";
import { SessionHistoryDrawer } from "./SessionHistoryDrawer";
import type { Protocol, ProtocolSummary, ProtocolStatus } from "./types";

export default function ProtocolTrackerPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [summary, setSummary] = useState<ProtocolSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProtocolStatus | "all">("all");

  // Modal states
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [protocolsRes, summaryRes] = await Promise.all([
        fetch("/api/protocols"),
        fetch("/api/protocols/summary"),
      ]);

      if (protocolsRes.ok && summaryRes.ok) {
        const protocolsData = await protocolsRes.json();
        const summaryData = await summaryRes.json();
        setProtocols(protocolsData);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error("Failed to fetch protocols:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProtocols = useMemo(() => {
    return protocols.filter((protocol) => {
      const matchesSearch = protocol.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || protocol.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [protocols, searchQuery, statusFilter]);

  const handleOpenSession = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setSessionModalOpen(true);
  };

  const handleViewHistory = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setHistoryDrawerOpen(true);
  };

  const handleSessionCreated = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-right">
          מעקב פרוטוקולי אימון
        </h1>
        <p className="text-muted-foreground mt-1 text-right">
          עקוב אחר יישום 20 פרוטוקולי ה-SOP באימוני הפסנתר
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-pastel-teal border-pastel-teal shadow-card rounded-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 text-right">
                סה"כ פרוטוקולים
              </CardTitle>
              <div className="p-2 rounded-full bg-background/50">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-pastel-beige border-pastel-beige shadow-card rounded-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 text-right">
                לא התחיל
              </CardTitle>
              <div className="p-2 rounded-full bg-background/50">
                <Circle className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.not_started}</div>
            </CardContent>
          </Card>

          <Card className="bg-pastel-blue border-pastel-blue shadow-card rounded-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 text-right">
                בתהליך
              </CardTitle>
              <div className="p-2 rounded-full bg-background/50">
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.in_progress}</div>
            </CardContent>
          </Card>

          <Card className="bg-pastel-green border-pastel-green shadow-card rounded-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 text-right">
                הושלם
              </CardTitle>
              <div className="p-2 rounded-full bg-background/50">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.completed}</div>
              <p className="text-xs text-foreground/60 mt-1">
                {Math.round(summary.average_progress * 100)}% ממוצע
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש פרוטוקול..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 text-right"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ProtocolStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-[200px] text-right">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="not_started">לא התחיל</SelectItem>
            <SelectItem value="in_progress">בתהליך</SelectItem>
            <SelectItem value="completed">הושלם</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Protocols Grid */}
      {filteredProtocols.length === 0 ? (
        <Card className="shadow-card rounded-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>לא נמצאו פרוטוקולים התואמים לחיפוש</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProtocols.map((protocol) => (
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              onOpenSession={handleOpenSession}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SessionLogModal
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        protocol={selectedProtocol}
        onSessionCreated={handleSessionCreated}
      />

      <SessionHistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        protocol={selectedProtocol}
      />
    </div>
  );
}
