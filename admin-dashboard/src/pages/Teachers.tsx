import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Upload, Plus, Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { apiRequest } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import DynamicFieldRenderer, { type CustomField } from "@/components/forms/DynamicFieldRenderer";
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
import { downloadCsv, parseCsvToObjects, rowsToCsv } from "@/lib/csv";

type Teacher = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subjects?: string[];
  status?: string;
  customFields?: Record<string, any>;
};

type CreateTeacherFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  tempPassword: string;
  phone?: string;
  subjectsText?: string;
  customFields: Record<string, any>;
};

type EditTeacherFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subjectsText?: string;
  qualification?: string;
  experience?: string;
  role?: string;
  status?: string;
  customFields: Record<string, any>;
  newPassword?: string;
};

type TeacherProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  qualification?: string;
  experience?: string;
  subjects?: string[];
  role?: string;
  status?: string;
};

function getSeedSchoolId(): string {
  const stored = String(localStorage.getItem("schoolId") || "").trim();
  if (stored) return stored;

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return "";

  try {
    const user = JSON.parse(rawUser);
    const allowed: unknown = user?.allowedSchoolIds;
    if (Array.isArray(allowed) && allowed.length > 0) {
      return String(allowed[0] || "").trim();
    }
  } catch {
    // ignore
  }

  return "";
}

const Teachers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const createForm = useForm<CreateTeacherFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      tempPassword: "",
      phone: "",
      subjectsText: "",
      customFields: {},
    },
    mode: "onChange",
  });

  const editForm = useForm<EditTeacherFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subjectsText: "",
      qualification: "",
      experience: "",
      role: "",
      status: "ACTIVE",
      customFields: {},
      newPassword: "",
    },
    mode: "onChange",
  });

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Teacher | null>(null);

  async function loadTeachers() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest<any>("/api/teachers?limit=100");
      const items: Teacher[] = Array.isArray(res?.data) ? res.data : [];
      setTeachers(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load teachers");
    } finally {
      setLoading(false);
    }

  }

  function openView(t: Teacher) {
    setSelected(t);
    setViewOpen(true);
  }

  async function loadCustomFields() {
    try {
      const res = await apiRequest<any>("/api/custom-fields?visibility=teacher");
      const items: CustomField[] = Array.isArray(res?.data) ? res.data : [];
      setCustomFields(items.filter((f) => f.enabled).sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (e: any) {
      console.error("[Admin Teachers] Failed to load custom fields", {
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setCustomFields([]);
    }
  }

  async function openEdit(t: Teacher) {
    setSelected(t);
    setEditOpen(true);

    editForm.reset({
      firstName: t.firstName || "",
      lastName: t.lastName || "",
      email: t.email || "",
      phone: t.phone || "",
      subjectsText: Array.isArray(t.subjects) ? t.subjects.join(", ") : "",
      qualification: "",
      experience: "",
      role: "",
      status: String(t.status || "ACTIVE") || "ACTIVE",
      customFields: {},
      newPassword: "",
    });

    try {
      await loadCustomFields();
    } catch {
      // ignore
    }

    try {
      const res = await apiRequest<any>(`/api/teachers/${t._id}`);
      const full = res?.data as Teacher;
      const cf = (full && typeof full.customFields === "object" && full.customFields) ? (full.customFields as Record<string, any>) : {};
      editForm.reset({
        firstName: full?.firstName || t.firstName || "",
        lastName: full?.lastName || t.lastName || "",
        email: full?.email || t.email || "",
        phone: full?.phone || t.phone || "",
        subjectsText: Array.isArray(full?.subjects) ? full!.subjects!.join(", ") : Array.isArray(t.subjects) ? t.subjects.join(", ") : "",
        qualification: "",
        experience: "",
        role: "",
        status: String(full?.status || t.status || "ACTIVE") || "ACTIVE",
        customFields: cf,
        newPassword: "",
      });
    } catch {
      // ignore
    }

    (async () => {
      try {
        const res = await apiRequest<any>(`/api/teacher/profile/${t._id}`);
        const p: TeacherProfile | null = res?.data || null;
        if (!p) return;

        editForm.setValue("qualification", String(p.qualification || ""));
        editForm.setValue("experience", String(p.experience || ""));
        editForm.setValue("role", String(p.role || ""));
        if (p.status) editForm.setValue("status", String(p.status));
      } catch (e: any) {
        if (Number(e?.status) === 404) return;
        console.error("[Admin Teachers] Failed to load teacher profile", {
          teacherId: t._id,
          status: e?.status,
          payload: e?.payload,
          message: e?.message,
        });
      }
    })();
  }

  async function handleUpdateTeacher(values: EditTeacherFormValues) {
    if (!selected?._id) return;

    const prevStatus = String(selected.status || "");

    const fn = String(values.firstName || "").trim();
    const ln = String(values.lastName || "").trim();
    const em = String(values.email || "").trim();

    if (!fn || !ln || !em) {
      toast.error("firstName, lastName, email are required");
      return;
    }

    const subjects = String(values.subjectsText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const customFieldsPayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(values.customFields || {})) {
      if (v === undefined || v === null || v === "") continue;
      customFieldsPayload[k] = v;
    }

    const nextPassword = String(values.newPassword || "").trim();

    try {
      setEditing(true);

      if (nextPassword) {
        await apiRequest(`/api/auth/change-password/${selected._id}`, {
          method: "PUT",
          body: { newPassword: nextPassword },
        });
      }

      await Promise.all([
        apiRequest(`/api/teachers/${selected._id}`, {
          method: "PUT",
          body: {
            firstName: fn,
            lastName: ln,
            email: em,
            phone: String(values.phone || "").trim() || undefined,
            subjects: subjects.length ? subjects : undefined,
            customFields: customFieldsPayload,
          }
        }),
        apiRequest(`/api/teacher/profile/${selected._id}`, {
          method: "PUT",
          body: {
            firstName: fn,
            lastName: ln,
            email: em,
            phone: String(values.phone || "").trim() || undefined,
            qualification: String(values.qualification || "").trim() || undefined,
            experience: String(values.experience || "").trim() || undefined,
            subjects: subjects.length ? subjects : undefined,
            role: String(values.role || "").trim() || undefined,
            status: values.status || undefined,
          }
        })
      ]);

      if (values.status && values.status !== prevStatus) {
        await apiRequest(`/api/teachers/${selected._id}/status`, {
          method: "PATCH",
          body: {
            status: values.status
          }
        });
      }

      toast.success("Teacher updated");
      setEditOpen(false);
      setSelected(null);
      await loadTeachers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update teacher");
    } finally {
      setEditing(false);
    }
  }

  async function handleDeleteTeacher(t: Teacher) {
    try {
      await apiRequest(`/api/teachers/${t._id}`, { method: "DELETE" });
      toast.success("Teacher deleted");
      await loadTeachers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete teacher");
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (!createOpen) return;
    void loadCustomFields();
  }, [createOpen]);

  useEffect(() => {
    if (!editOpen) return;
    void loadCustomFields();
  }, [editOpen]);

  async function handleCreateTeacher(values: CreateTeacherFormValues) {
    const fn = values.firstName.trim();
    const ln = values.lastName.trim();
    const em = values.email.trim();
    const pw = values.tempPassword;

    const subjects = String(values.subjectsText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setCreating(true);

      const schoolId = getSeedSchoolId();
      if (!schoolId) {
        toast.error("schoolId missing. Please log in again.");
        setCreating(false);
        return;
      }

      const authRes = await apiRequest<any>("/api/auth/register", {
        method: "POST",
        body: {
          name: `${fn} ${ln}`.trim(),
          email: em,
          password: pw,
          role: "teacher",
          allowedSchoolIds: [schoolId],
        },
      });

      const authUserId = String(authRes?.data?.id || "").trim();
      if (!authUserId) {
        toast.error("Failed to create auth user");
        return;
      }

      const customFieldsPayload: Record<string, any> = {};
      for (const [k, v] of Object.entries(values.customFields || {})) {
        if (v === undefined || v === null || v === "") continue;
        customFieldsPayload[k] = v;
      }

      await apiRequest("/api/teachers", {
        method: "POST",
        body: {
          authUserId,
          firstName: fn,
          lastName: ln,
          email: em,
          phone: String(values.phone || "").trim() || undefined,
          subjects: subjects.length ? subjects : undefined,
          customFields: customFieldsPayload,
          status: "ACTIVE"
        }
      });

      toast.success("Teacher created");
      setCreateOpen(false);
      createForm.reset();
      setCustomFields([]);
      await loadTeachers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create teacher");
    } finally {
      setCreating(false);
    }
  }

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const name = `${t.firstName} ${t.lastName}`.toLowerCase();
      const subjects = Array.isArray(t.subjects) ? t.subjects.join(", ").toLowerCase() : "";
      return (
        name.includes(q) ||
        String(t.email || "").toLowerCase().includes(q) ||
        subjects.includes(q)
      );
    });
  }, [teachers, searchTerm]);

  async function handleExport() {
    try {
      if (!customFields.length) {
        await loadCustomFields();
      }

      const enabledFields = customFields.filter((f) => f.enabled).sort((a, b) => (a.order || 0) - (b.order || 0));
      const cfColumnKeys = enabledFields.map((f) => {
        const safe = String(f.label || "custom").trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
        return `custom_${safe || "field"}_${String(f._id).slice(-6)}`;
      });

      const details = await Promise.allSettled(
        filtered.map((t) => apiRequest<any>(`/api/teachers/${encodeURIComponent(t._id)}`))
      );

      const byId = new Map<string, Teacher>();
      for (let i = 0; i < filtered.length; i++) {
        const id = filtered[i]?._id;
        const d = details[i];
        if (d && d.status === "fulfilled") {
          byId.set(String(id), d.value?.data as Teacher);
        }
      }

      const rows = filtered.map((t) => {
        const full = byId.get(String(t._id)) || t;
        const cf = (full && typeof full.customFields === "object" && full.customFields) ? (full.customFields as Record<string, any>) : {};
        const baseRow: Record<string, any> = {
          _id: t._id,
          firstName: full.firstName,
          lastName: full.lastName,
          email: full.email,
          phone: full.phone || "",
          subjects: Array.isArray(full.subjects) ? full.subjects.join(", ") : "",
          status: full.status || "",
        };

        enabledFields.forEach((f, idx) => {
          const key = cfColumnKeys[idx];
          const raw = (cf as any)?.[String(f._id)];
          baseRow[key] = raw === undefined || raw === null ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw);
        });

        return baseRow;
      });

      const columns = ["_id", "firstName", "lastName", "email", "phone", "subjects", "status", ...cfColumnKeys];
      const csv = rowsToCsv(rows, columns);
      downloadCsv(`teachers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (e: any) {
      toast.error(e?.message || "Export failed");
    }
  }

  function openImportPicker() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const rows = parseCsvToObjects(text);
    if (!rows.length) {
      toast.error("No rows found in CSV");
      return;
    }

    const payloads = rows.map((r) => ({
      firstName: String(r.firstName || r.firstname || r["first name"] || "").trim(),
      lastName: String(r.lastName || r.lastname || r["last name"] || "").trim(),
      email: String(r.email || "").trim(),
      phone: String(r.phone || "").trim() || undefined,
      subjects: String(r.subjects || r.subject || "")
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status: "ACTIVE",
    }));

    const valid = payloads.filter((p) => p.firstName && p.lastName && p.email);
    if (!valid.length) {
      toast.error("CSV must include firstName,lastName,email");
      return;
    }

    let created = 0;
    let failed = 0;

    for (const p of valid) {
      try {
        await apiRequest("/api/teachers", {
          method: "POST",
          body: {
            ...p,
            subjects: p.subjects.length ? p.subjects : undefined,
          },
        });
        created++;
      } catch {
        failed++;
      }
    }

    if (created) toast.success(`Imported ${created} teachers`);
    if (failed) toast.error(`${failed} teachers failed to import`);
    await loadTeachers();
  }

  return (
    <div className="p-6 space-y-6">
      {/* --- HEADER SECTION (Fixed Layout) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">Manage faculty members and assignments.</p>
        </div>

        {/* Buttons Group - Always Visible on Laptop */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={openImportPicker}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                await handleImportFile(f);
              } catch (err: any) {
                toast.error(err?.message || "Import failed");
              }
            }}
          />

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Teacher</DialogTitle>
              </DialogHeader>

              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateTeacher)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First name</Label>
                      <Input
                        {...createForm.register("firstName", { required: "First name is required" })}
                      />
                      {createForm.formState.errors.firstName?.message ? (
                        <div className="text-xs text-destructive">{createForm.formState.errors.firstName.message}</div>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Last name</Label>
                      <Input
                        {...createForm.register("lastName", { required: "Last name is required" })}
                      />
                      {createForm.formState.errors.lastName?.message ? (
                        <div className="text-xs text-destructive">{createForm.formState.errors.lastName.message}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      {...createForm.register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                      })}
                    />
                    {createForm.formState.errors.email?.message ? (
                      <div className="text-xs text-destructive">{createForm.formState.errors.email.message}</div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label>Initial password</Label>
                    <Input
                      type="password"
                      {...createForm.register("tempPassword", { required: "Password is required" })}
                    />
                    {createForm.formState.errors.tempPassword?.message ? (
                      <div className="text-xs text-destructive">{createForm.formState.errors.tempPassword.message}</div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input {...createForm.register("phone")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Subjects (comma-separated)</Label>
                    <Textarea
                      {...createForm.register("subjectsText")}
                      placeholder="Math, Physics, English"
                    />
                  </div>

                  {customFields.length ? (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Custom Fields</div>
                      {customFields.map((f) => (
                        <DynamicFieldRenderer<CreateTeacherFormValues>
                          key={f._id}
                          field={f}
                          control={createForm.control}
                          name={`customFields.${f._id}`}
                        />
                      ))}
                    </div>
                  ) : null}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateOpen(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating || !createForm.formState.isValid}>
                      {creating ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="flex items-center gap-2 bg-background/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teachers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Mobile-only Icons (so you can still export on phone if needed) */}
        <div className="flex sm:hidden gap-1">
             <Button variant="ghost" size="icon" onClick={openImportPicker}><Upload className="h-4 w-4"/></Button>
             <Button variant="ghost" size="icon" onClick={handleExport}><Download className="h-4 w-4"/></Button>
        </div>
      </div>

      {/* --- TEACHERS LIST --- */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Loading teachers...</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">No teachers found.</CardContent>
          </Card>
        ) : (
          filtered.map((teacher) => (
          <Card key={teacher._id}>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Teacher Info */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                    {String(teacher.firstName || "?").charAt(0)}
                </div>
                <div>
                    <div className="font-semibold">{teacher.firstName} {teacher.lastName}</div>
                    <div className="text-sm text-muted-foreground">{Array.isArray(teacher.subjects) && teacher.subjects.length ? teacher.subjects.join(", ") : "-"}</div>
                </div>
              </div>

              {/* Contact Info (Hidden on small phones, visible on laptop) */}
              <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {teacher.email || "-"}
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {teacher.phone || "-"}
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between w-full md:w-auto gap-4">
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                     teacher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                 }`}>
                    {teacher.status || 'UNKNOWN'}
                 </span>

                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openView(teacher)}>View Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(teacher)}>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <span className="w-full">Delete</span>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete teacher?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the teacher.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTeacher(teacher)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>

            </CardContent>
          </Card>
        ))
        )}
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teacher Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {selected ? `${selected.firstName} ${selected.lastName}` : '-'}</div>
            <div><span className="text-muted-foreground">Email:</span> {selected?.email || '-'}</div>
            <div><span className="text-muted-foreground">Phone:</span> {selected?.phone || '-'}</div>
            <div><span className="text-muted-foreground">Subjects:</span> {Array.isArray(selected?.subjects) && selected?.subjects?.length ? selected?.subjects?.join(', ') : '-'}</div>
            <div><span className="text-muted-foreground">Status:</span> {selected?.status || '-'}</div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateTeacher)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input {...editForm.register("firstName", { required: "First name is required" })} />
                  {editForm.formState.errors.firstName?.message ? (
                    <div className="text-xs text-destructive">{String(editForm.formState.errors.firstName.message)}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input {...editForm.register("lastName", { required: "Last name is required" })} />
                  {editForm.formState.errors.lastName?.message ? (
                    <div className="text-xs text-destructive">{String(editForm.formState.errors.lastName.message)}</div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  {...editForm.register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.[^\s]+$/, message: "Invalid email" },
                  })}
                />
                {editForm.formState.errors.email?.message ? (
                  <div className="text-xs text-destructive">{String(editForm.formState.errors.email.message)}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input {...editForm.register("phone")} />
              </div>

              <div className="space-y-2">
                <Label>Subjects (comma-separated)</Label>
                <Textarea {...editForm.register("subjectsText")} placeholder="Math, Physics, English" />
              </div>

              <div className="space-y-2">
                <Label>Qualification (optional)</Label>
                <Input {...editForm.register("qualification")} />
              </div>

              <div className="space-y-2">
                <Label>Experience (optional)</Label>
                <Input {...editForm.register("experience")} />
              </div>

              <div className="space-y-2">
                <Label>Role (optional)</Label>
                <Input {...editForm.register("role")} placeholder="e.g., Senior Teacher" />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={String(editForm.watch("status") || "ACTIVE")} onValueChange={(v) => editForm.setValue("status", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>New Password (optional)</Label>
                <Input type="password" autoComplete="new-password" {...editForm.register("newPassword")} />
              </div>

              {customFields.length ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Custom Fields</div>
                  {customFields.map((f) => (
                    <DynamicFieldRenderer<EditTeacherFormValues>
                      key={f._id}
                      field={f}
                      control={editForm.control}
                      name={`customFields.${f._id}`}
                    />
                  ))}
                </div>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setSelected(null);
                  }}
                  disabled={editing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editing || !editForm.formState.isValid}>
                  {editing ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teachers;