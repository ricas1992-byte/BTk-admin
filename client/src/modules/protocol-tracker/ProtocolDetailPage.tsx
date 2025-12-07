import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Circle, Clock, CheckCircle2 } from "lucide-react";
import { BasicSessionModal } from "./BasicSessionModal";
import type { Protocol } from "./types";

export default function ProtocolDetailPage() {
  const [, params] = useRoute("/protocols/:id");
  const [, setLocation] = useLocation();
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchProtocol(parseInt(params.id, 10));
    }
  }, [params?.id]);

  const fetchProtocol = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/protocols/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProtocol(data);
      }
    } catch (error) {
      console.error("Failed to fetch protocol:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCreated = () => {
    if (params?.id) {
      fetchProtocol(parseInt(params.id, 10));
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      not_started: "לא התחיל",
      in_progress: "בתהליך",
      completed: "הושלם",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_started":
        return <Circle className="h-5 w-5" />;
      case "in_progress":
        return <Clock className="h-5 w-5" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDesignStatusLabel = (status: string) => {
    const labels = {
      draft: "טיוטה",
      in_progress: "בהכנה",
      approved: "מאושר לעבודה",
    };
    return labels[status as keyof typeof labels] || status;
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

  if (!protocol) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">פרוטוקול לא נמצא</p>
            <Button
              variant="outline"
              onClick={() => setLocation("/protocols")}
              className="mt-4"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה לרשימה
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Button
            variant="ghost"
            onClick={() => setLocation("/protocols")}
            className="mb-4 pr-0"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לרשימה
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-right">
            {protocol.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-right">
            פרוטוקול #{protocol.id}
          </p>
        </div>
      </div>

      {/* Protocol Details Card */}
      <Card className="shadow-card rounded-card">
        <CardHeader>
          <CardTitle className="text-right">פרטי פרוטוקול</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">סטטוס תכנוני</p>
              <Badge variant="outline">
                {getDesignStatusLabel(protocol.design_status)}
              </Badge>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">סטטוס אימון</p>
              <div className="flex items-center justify-end gap-2">
                <Badge
                  className={`${getStatusColor(protocol.status)} flex items-center gap-1`}
                >
                  {getStatusIcon(protocol.status)}
                  {getStatusLabel(protocol.status)}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">התקדמות</p>
              <div className="flex items-center justify-end gap-2">
                <span className="font-semibold">
                  {Math.round(protocol.progress * 100)}%
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${protocol.progress * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                סשן אחרון
              </p>
              <p className="font-medium">
                {protocol.last_session
                  ? new Date(protocol.last_session).toLocaleDateString("he-IL")
                  : "אין"}
              </p>
            </div>
          </div>

          {protocol.notes && (
            <div className="text-right pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">הערות</p>
              <p className="text-sm">{protocol.notes}</p>
            </div>
          )}

          {protocol.next_focus && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">מיקוד הבא</p>
              <p className="text-sm">{protocol.next_focus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="shadow-card rounded-card">
        <CardHeader>
          <CardTitle className="text-right">פעולות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => setSessionModalOpen(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="ml-2 h-5 w-5" />
              פתח סשן אימון
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              תיעוד סשן אימון ייצור רשומה ויעדכן את סטטוס הפרוטוקול
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Session Modal */}
      <BasicSessionModal
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        protocol={protocol}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  );
}
