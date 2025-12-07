import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, History, CheckCircle2, Clock, Circle } from "lucide-react";
import { useLocation } from "wouter";
import type { Protocol } from "./types";

interface ProtocolCardProps {
  protocol: Protocol;
  onOpenSession: (protocol: Protocol) => void;
  onViewHistory: (protocol: Protocol) => void;
}

const statusConfig = {
  not_started: {
    label: "לא התחיל",
    color: "bg-pastel-beige text-foreground",
    icon: Circle,
  },
  in_progress: {
    label: "בתהליך",
    color: "bg-pastel-blue text-foreground",
    icon: Clock,
  },
  completed: {
    label: "הושלם",
    color: "bg-pastel-green text-foreground",
    icon: CheckCircle2,
  },
};

export function ProtocolCard({ protocol, onOpenSession, onViewHistory }: ProtocolCardProps) {
  const config = statusConfig[protocol.status];
  const StatusIcon = config.icon;
  const progressPercent = Math.round(protocol.progress * 100);
  const [, setLocation] = useLocation();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    setLocation(`/protocols/${protocol.id}`);
  };

  return (
    <Card
      className="shadow-card rounded-card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold text-right flex-1">
            {protocol.name}
          </CardTitle>
          <Badge className={`${config.color} flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">התקדמות</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Last Session */}
        {protocol.last_session && (
          <div className="text-sm text-muted-foreground text-right">
            <span>סשן אחרון: </span>
            <span className="font-medium">
              {new Date(protocol.last_session).toLocaleDateString("he-IL")}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onOpenSession(protocol)}
            className="flex-1 rounded-button"
            variant="default"
          >
            <PlayCircle className="h-4 w-4 ml-2" />
            פתח סשן אימון
          </Button>
          <Button
            onClick={() => onViewHistory(protocol)}
            variant="outline"
            size="icon"
            className="rounded-button"
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
