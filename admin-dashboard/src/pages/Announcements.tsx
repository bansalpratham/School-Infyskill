import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AnnouncementTarget = "teacher" | "student" | "both";
type AnnouncementStatus = "PUBLISHED" | "DRAFT";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  target: AnnouncementTarget;
  status: AnnouncementStatus;
  createdAt?: string;
};

export default function Announcements() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Announcement[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<AnnouncementTarget>("both");
  const [published, setPublished] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await apiRequest<any>("/api/announcements?limit=100");
      const rows: Announcement[] = Array.isArray(res?.data) ? res.data : [];
      setItems(rows);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    const safeTitle = title.trim();
    const safeMessage = message.trim();

    if (!safeTitle || !safeMessage) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setCreating(true);
      const res = await apiRequest<any>("/api/announcements", {
        method: "POST",
        body: {
          title: safeTitle,
          message: safeMessage,
          target,
          status: published ? "PUBLISHED" : "DRAFT",
        },
      });

      const created: Announcement | null = res?.data || null;
      if (created) {
        setItems((prev) => [created, ...prev]);
      } else {
        await load();
      }

      toast.success("Announcement created");
      setCreateOpen(false);
      setTitle("");
      setMessage("");
      setTarget("both");
      setPublished(true);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create announcement");
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(a: Announcement, nextPublished: boolean) {
    const nextStatus: AnnouncementStatus = nextPublished ? "PUBLISHED" : "DRAFT";

    setItems((prev) => prev.map((x) => (x._id === a._id ? { ...x, status: nextStatus } : x)));
    try {
      await apiRequest(`/api/announcements/${a._id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status");
      await load();
    }
  }

  async function handleDelete(a: Announcement) {
    try {
      await apiRequest(`/api/announcements/${a._id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x._id !== a._id));
      toast.success("Announcement deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete announcement");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Broadcast news to students and teachers.</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Announcement</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write announcement..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Send to</Label>
                  <Select value={target} onValueChange={(v) => setTarget(v as AnnouncementTarget)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="both">Teacher + Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between sm:justify-start sm:gap-3 mt-6">
                  <Label>Published</Label>
                  <Switch checked={published} onCheckedChange={(v) => setPublished(!!v)} />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No announcements yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="max-w-[420px]">
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{a.message}</div>
                    </TableCell>
                    <TableCell className="capitalize">{a.target}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>
                      <Switch
                        checked={a.status === "PUBLISHED"}
                        onCheckedChange={(v) => toggleStatus(a, !!v)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the announcement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(a)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}