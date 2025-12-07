import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Protocol, ProtocolStatus, BasicSessionRequest } from "./types";

interface BasicSessionModalProps {
  open: boolean;
  onClose: () => void;
  protocol: Protocol | null;
  onSessionCreated?: () => void;
}

export function BasicSessionModal({
  open,
  onClose,
  protocol,
  onSessionCreated,
}: BasicSessionModalProps) {
  const [formData, setFormData] = useState<BasicSessionRequest>({
    date: new Date().toISOString().split("T")[0],
    piece_title: "",
    duration_minutes: 30,
    notes: "",
    status_after_session: "in_progress",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/protocols/${protocol.id}/sessions/basic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onClose();
        onSessionCreated?.();
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          piece_title: "",
          duration_minutes: 30,
          notes: "",
          status_after_session: "in_progress",
        });
      } else {
        alert("שגיאה בשמירת הסשן");
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("שגיאה בשמירת הסשן");
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: ProtocolStatus) => {
    const labels = {
      not_started: "לא התחיל",
      in_progress: "בתהליך",
      completed: "הושלם",
    };
    return labels[status];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">פתיחת סשן אימון</DialogTitle>
          {protocol && (
            <p className="text-sm text-muted-foreground text-right">
              {protocol.name}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-right block">
                תאריך
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="text-right"
                required
              />
            </div>

            {/* Piece Title */}
            <div className="space-y-2">
              <Label htmlFor="piece" className="text-right block">
                יצירה / קטע
              </Label>
              <Input
                id="piece"
                value={formData.piece_title}
                onChange={(e) =>
                  setFormData({ ...formData, piece_title: e.target.value })
                }
                placeholder="לדוגמה: בטהובן - סונטה 14, מונלייט"
                className="text-right"
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-right block">
                משך האימון (דקות)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="300"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value, 10),
                  })
                }
                className="text-right"
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-right block">
                הערות
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="מה עבדתי היום? מה הלך טוב? על מה לשים דגש בפעם הבאה?"
                className="text-right min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Status After Session */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-right block">
                סטטוס אחרי הסשן
              </Label>
              <Select
                value={formData.status_after_session}
                onValueChange={(value: ProtocolStatus) =>
                  setFormData({ ...formData, status_after_session: value })
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue>
                    {getStatusLabel(formData.status_after_session)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">לא התחיל</SelectItem>
                  <SelectItem value="in_progress">בתהליך</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground text-right">
                הסטטוס יעודכן בפרוטוקול לפי הבחירה שלך
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                "שמור סשן"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
