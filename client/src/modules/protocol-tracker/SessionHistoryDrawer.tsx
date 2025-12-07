import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Music, Star } from "lucide-react";
import type { Protocol, ProtocolSession } from "./types";

interface SessionHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  protocol: Protocol | null;
}

export function SessionHistoryDrawer({
  open,
  onClose,
  protocol,
}: SessionHistoryDrawerProps) {
  const [sessions, setSessions] = useState<ProtocolSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && protocol) {
      fetchSessions();
    }
  }, [open, protocol]);

  const fetchSessions = async () => {
    if (!protocol) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/protocols/${protocol.id}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "bg-pastel-green";
    if (score >= 3) return "bg-pastel-blue";
    return "bg-pastel-rose";
  };

  if (!protocol) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]" dir="rtl">
        <SheetHeader className="text-right">
          <SheetTitle className="text-xl">
            היסטוריית סשנים - {protocol.name}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6 pl-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              טוען...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>עדיין אין סשנים לפרוטוקול זה</p>
              <p className="text-sm mt-2">התחל לתעד את האימונים שלך!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header: Date & Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.date).toLocaleDateString("he-IL", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <Badge
                        className={`${getScoreColor(session.subjective_progress_score)} flex items-center gap-1`}
                      >
                        <Star className="h-3 w-3" />
                        {session.subjective_progress_score}/5
                      </Badge>
                    </div>

                    {/* Piece & Composer */}
                    <div className="text-right">
                      <h4 className="font-semibold text-base">
                        {session.piece_title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {session.composer}
                      </p>
                    </div>

                    {/* Duration */}
                    {session.duration_minutes > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {session.duration_minutes} דקות
                      </div>
                    )}

                    {/* Notes */}
                    {session.notes && (
                      <div className="p-3 bg-muted/50 rounded-md text-sm text-right">
                        <p className="font-medium mb-1">הערות:</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {session.notes}
                        </p>
                      </div>
                    )}

                    {/* Next Time Hint */}
                    {session.next_time_hint && (
                      <div className="p-3 bg-primary/5 rounded-md text-sm text-right border border-primary/10">
                        <p className="font-medium mb-1">למקד הבא:</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {session.next_time_hint}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
