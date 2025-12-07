import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, Save, Loader2 } from "lucide-react";
import type { Protocol, DesignStatus } from "./types";

export default function ProtocolsAdminPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/protocols/meta");
      if (res.ok) {
        const data = await res.json();
        setProtocols(data);
      }
    } catch (error) {
      console.error("Failed to fetch protocols:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = protocols.map((p) => ({
        id: p.id,
        name: p.name,
        design_status: p.design_status,
        is_active_for_practice: p.is_active_for_practice,
        admin_notes: p.admin_notes,
      }));

      const res = await fetch("/api/protocols/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedProtocols = await res.json();
        setProtocols(updatedProtocols);
        alert("הפרוטוקולים נשמרו בהצלחה!");
      }
    } catch (error) {
      console.error("Failed to save protocols:", error);
      alert("שגיאה בשמירת הפרוטוקולים");
    } finally {
      setSaving(false);
    }
  };

  const updateProtocol = (id: number, field: keyof Protocol, value: any) => {
    setProtocols((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const getDesignStatusLabel = (status: DesignStatus) => {
    const labels = {
      draft: "טיוטה",
      in_progress: "בהכנה",
      approved: "מאושר לעבודה",
    };
    return labels[status];
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-right">
            ניהול פרוטוקולים (Admin)
          </h1>
          <p className="text-muted-foreground mt-1 text-right">
            הגדרת פרוטוקולי האימון - שמות, סטטוס תכנוני, והפעלה לאימון
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              שמור שינויים
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 shadow-card rounded-card">
        <CardContent className="py-4">
          <div className="flex items-start gap-3 text-right">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">הנחיות לשימוש:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>ערוך את שמות הפרוטוקולים לפי הצורך</li>
                <li>
                  סמן "סטטוס תכנוני" כ"מאושר לעבודה" כאשר הפרוטוקול מוכן לשימוש
                </li>
                <li>
                  הפעל את הטוגל "פעיל לאימון" רק לפרוטוקולים שאתה רוצה לעבוד איתם
                  כרגע
                </li>
                <li>
                  רק פרוטוקולים שהם "מאושר לעבודה" + "פעיל לאימון" יופיעו
                  בסטטיסטיקות
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocols Table */}
      <Card className="shadow-card rounded-card">
        <CardHeader>
          <CardTitle className="text-right">טבלת פרוטוקולים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-16">#</TableHead>
                  <TableHead className="text-right min-w-[200px]">
                    שם פרוטוקול
                  </TableHead>
                  <TableHead className="text-right min-w-[150px]">
                    סטטוס תכנוני
                  </TableHead>
                  <TableHead className="text-right w-32">
                    פעיל לאימון
                  </TableHead>
                  <TableHead className="text-right min-w-[200px]">
                    הערות
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {protocols.map((protocol) => (
                  <TableRow key={protocol.id}>
                    <TableCell className="font-medium text-right">
                      {protocol.id}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={protocol.name}
                        onChange={(e) =>
                          updateProtocol(protocol.id, "name", e.target.value)
                        }
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={protocol.design_status}
                        onValueChange={(value: DesignStatus) =>
                          updateProtocol(protocol.id, "design_status", value)
                        }
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue>
                            {getDesignStatusLabel(protocol.design_status)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">טיוטה</SelectItem>
                          <SelectItem value="in_progress">בהכנה</SelectItem>
                          <SelectItem value="approved">
                            מאושר לעבודה
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={protocol.is_active_for_practice}
                          onCheckedChange={(checked) =>
                            updateProtocol(
                              protocol.id,
                              "is_active_for_practice",
                              checked
                            )
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={protocol.admin_notes}
                        onChange={(e) =>
                          updateProtocol(
                            protocol.id,
                            "admin_notes",
                            e.target.value
                          )
                        }
                        placeholder="הערות..."
                        className="text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              שמור שינויים
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
