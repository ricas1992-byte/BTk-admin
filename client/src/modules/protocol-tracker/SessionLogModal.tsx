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
import { useToast } from "@/hooks/use-toast";
import type { Protocol, CreateSessionRequest } from "./types";

interface SessionLogModalProps {
  open: boolean;
  onClose: () => void;
  protocol: Protocol | null;
  onSessionCreated: () => void;
}

export function SessionLogModal({
  open,
  onClose,
  protocol,
  onSessionCreated,
}: SessionLogModalProps) {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<CreateSessionRequest>({
    date: today,
    piece_title: "",
    composer: "",
    duration_minutes: 30,
    subjective_progress_score: 3,
    notes: "",
    next_time_hint: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!protocol) return;

    if (!formData.piece_title || !formData.composer) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/protocols/${protocol.id}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      toast({
        title: "הצלחה!",
        description: "הסשן נשמר בהצלחה",
      });

      // Reset form
      setFormData({
        date: today,
        piece_title: "",
        composer: "",
        duration_minutes: 30,
        subjective_progress_score: 3,
        notes: "",
        next_time_hint: "",
      });

      onSessionCreated();
      onClose();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הסשן",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!protocol) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">
            סשן אימון חדש - {protocol.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="piece_title" className="text-right block">
              שם היצירה *
            </Label>
            <Input
              id="piece_title"
              value={formData.piece_title}
              onChange={(e) =>
                setFormData({ ...formData, piece_title: e.target.value })
              }
              placeholder="לדוגמה: סונטה K.545"
              className="text-right"
              required
            />
          </div>

          {/* Composer */}
          <div className="space-y-2">
            <Label htmlFor="composer" className="text-right block">
              מלחין *
            </Label>
            <Input
              id="composer"
              value={formData.composer}
              onChange={(e) =>
                setFormData({ ...formData, composer: e.target.value })
              }
              placeholder="לדוגמה: מוצרט"
              className="text-right"
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-right block">
              משך הסשן (דקות)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration_minutes: parseInt(e.target.value, 10) || 0,
                })
              }
              className="text-right"
            />
          </div>

          {/* Progress Score */}
          <div className="space-y-2">
            <Label htmlFor="score" className="text-right block">
              ציון התקדמות (1-5)
            </Label>
            <Select
              value={formData.subjective_progress_score.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  subjective_progress_score: parseInt(value, 10),
                })
              }
            >
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - קשה מאוד</SelectItem>
                <SelectItem value="2">2 - קשה</SelectItem>
                <SelectItem value="3">3 - בינוני</SelectItem>
                <SelectItem value="4">4 - טוב</SelectItem>
                <SelectItem value="5">5 - מצוין</SelectItem>
              </SelectContent>
            </Select>
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
              placeholder="רשום הערות על הסשן..."
              className="text-right min-h-[80px]"
            />
          </div>

          {/* Next Time Hint */}
          <div className="space-y-2">
            <Label htmlFor="next_hint" className="text-right block">
              למה להתמקד בפעם הבאה
            </Label>
            <Textarea
              id="next_hint"
              value={formData.next_time_hint}
              onChange={(e) =>
                setFormData({ ...formData, next_time_hint: e.target.value })
              }
              placeholder="מה לתרגל בסשן הבא..."
              className="text-right min-h-[60px]"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "שומר..." : "שמור סשן"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
