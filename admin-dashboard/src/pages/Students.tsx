import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Upload, Plus, Search, Eye, Edit } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { apiRequest } from "@/lib/api";
import { downloadCsv, parseCsvToObjects, rowsToCsv } from "@/lib/csv";
import { Label } from "@/components/ui/label";
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

type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  className?: string;
  phone?: string;
  rollNumber?: string;
  admissionId?: string;
  status?: string;
  customFields?: Record<string, any>;
};

type CreateStudentFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  tempPassword: string;
  className: string;
  phone?: string;
  rollNumber?: string;
  admissionId?: string;
  customFields: Record<string, any>;
};

type EditStudentFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  className: string;
  phone?: string;
  rollNumber?: string;
  admissionId?: string;
  customFields: Record<string, any>;
  newPassword?: string;
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

const Students = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const createForm = useForm<CreateStudentFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      tempPassword: "",
      className: "",
      phone: "",
      rollNumber: "",
      admissionId: "",
      customFields: {},
    },
  });

  const editForm = useForm<EditStudentFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      className: "",
      phone: "",
      rollNumber: "",
      admissionId: "",
      customFields: {},
      newPassword: "",
    },
    mode: "onChange",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  async function loadStudents() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest<any>("/api/students?limit=100");
      const items: Student[] = Array.isArray(res?.data) ? res.data : [];
      setStudents(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }

  }

  async function openEdit(student: Student) {
    setSelected(student);
    setEditOpen(true);
    editForm.reset({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      className: student.className || "",
      phone: student.phone || "",
      rollNumber: student.rollNumber || "",
      admissionId: student.admissionId || "",
      customFields: {},
      newPassword: "",
    });

    try {
      await loadCustomFields();
    } catch {
      // ignore
    }

    try {
      const res = await apiRequest<any>(`/api/students/${student._id}`);
      const s = res?.data as Student;
      const cf = (s && typeof s.customFields === "object" && s.customFields) ? (s.customFields as Record<string, any>) : {};
      editForm.reset({
        firstName: s?.firstName || student.firstName || "",
        lastName: s?.lastName || student.lastName || "",
        email: s?.email || student.email || "",
        className: s?.className || student.className || "",
        phone: s?.phone || student.phone || "",
        rollNumber: s?.rollNumber || student.rollNumber || "",
        admissionId: s?.admissionId || student.admissionId || "",
        customFields: cf,
        newPassword: "",
      });
    } catch {
      // ignore
    }
  }

  async function handleUpdateStudent(values: EditStudentFormValues) {
    if (!selected?._id) return;

    const payload: any = {
      firstName: String(values.firstName || "").trim(),
      lastName: String(values.lastName || "").trim(),
      email: String(values.email || "").trim(),
      className: String(values.className || "").trim(),
      phone: String(values.phone || "").trim() || undefined,
      rollNumber: String(values.rollNumber || "").trim() || undefined,
      admissionId: String(values.admissionId || "").trim() || undefined,
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.className) {
      toast.error("firstName, lastName, email, className are required");
      return;
    }

    const customFieldsPayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(values.customFields || {})) {
      if (v === undefined || v === null || v === "") continue;
      customFieldsPayload[k] = v;
    }
    payload.customFields = customFieldsPayload;

    const nextPassword = String(values.newPassword || "").trim();

    try {
      setEditing(true);

      if (nextPassword) {
        await apiRequest(`/api/auth/change-password/${selected._id}`, {
          method: "PUT",
          body: { newPassword: nextPassword },
        });
      }

      await apiRequest(`/api/students/${selected._id}`, {
        method: "PUT",
        body: payload,
      });

      toast.success("Student updated");
      setEditOpen(false);
      setSelected(null);
      await loadStudents();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update student");
    } finally {
      setEditing(false);
    }
  }

  async function handleDeleteStudent(student: Student) {
    try {
      await apiRequest(`/api/students/${student._id}`, { method: "DELETE" });
      toast.success("Student deleted");
      await loadStudents();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete student");
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadCustomFields() {
    try {
      const res = await apiRequest<any>("/api/custom-fields?visibility=student");
      const items: CustomField[] = Array.isArray(res?.data) ? res.data : [];
      setCustomFields(items.filter((f) => f.enabled).sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err: any) {
      setCustomFields([]);
      toast.error(err?.message || "Failed to load custom fields");
    }
  }

  useEffect(() => {
    if (!createOpen) return;
    createForm.reset();
    void loadCustomFields();
  }, [createOpen]);

  useEffect(() => {
    if (!editOpen) return;
    void loadCustomFields();
  }, [editOpen]);

  async function handleCreateStudent(values: CreateStudentFormValues) {
    const fn = values.firstName.trim();
    const ln = values.lastName.trim();
    const em = values.email.trim();
    const cn = values.className.trim();
    const pw = values.tempPassword;

    try {
      setCreating(true);

      const schoolId = getSeedSchoolId();
      if (!schoolId) {
        toast.error("schoolId missing. Please log in again.");
        return;
      }

      const authRes = await apiRequest<any>("/api/auth/register", {
        method: "POST",
        body: {
          name: `${fn} ${ln}`.trim(),
          email: em,
          password: pw,
          role: "student",
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

      await apiRequest("/api/students", {
        method: "POST",
        body: {
          authUserId,
          firstName: fn,
          lastName: ln,
          email: em,
          className: cn,
          phone: String(values.phone || "").trim() || undefined,
          rollNumber: String(values.rollNumber || "").trim() || undefined,
          admissionId: String(values.admissionId || "").trim() || undefined,
          customFields: customFieldsPayload,
          status: "ACTIVE",
        },
      });

      toast.success("Student created");
      setCreateOpen(false);
      await loadStudents();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create student");
    } finally {
      setCreating(false);
    }
  }

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
      return name.includes(q) || String(s.email || "").toLowerCase().includes(q) || String(s.className || "").toLowerCase().includes(q);
    });
  }, [students, searchTerm]);

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
        filtered.map((s) => apiRequest<any>(`/api/students/${encodeURIComponent(s._id)}`))
      );

      const byId = new Map<string, Student>();
      for (let i = 0; i < filtered.length; i++) {
        const id = filtered[i]?._id;
        const d = details[i];
        if (d && d.status === "fulfilled") {
          byId.set(String(id), d.value?.data as Student);
        }
      }

      const rows = filtered.map((s) => {
        const full = byId.get(String(s._id)) || s;
        const cf = (full && typeof full.customFields === "object" && full.customFields) ? (full.customFields as Record<string, any>) : {};
        const baseRow: Record<string, any> = {
          _id: s._id,
          firstName: full.firstName,
          lastName: full.lastName,
          email: full.email,
          className: full.className || "",
          phone: full.phone || "",
          rollNumber: full.rollNumber || "",
          admissionId: full.admissionId || "",
          status: full.status || "",
        };

        enabledFields.forEach((f, idx) => {
          const key = cfColumnKeys[idx];
          const raw = (cf as any)?.[String(f._id)];
          baseRow[key] = raw === undefined || raw === null ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw);
        });

        return baseRow;
      });

      const columns = [
        "_id",
        "firstName",
        "lastName",
        "email",
        "className",
        "phone",
        "rollNumber",
        "admissionId",
        "status",
        ...cfColumnKeys,
      ];

      const csv = rowsToCsv(rows, columns);
      downloadCsv(`students-${new Date().toISOString().slice(0, 10)}.csv`, csv);
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
      className: String(r.className || r.class || r["class name"] || "").trim(),
      phone: String(r.phone || "").trim() || undefined,
      rollNumber: String(r.rollNumber || r.roll || r["roll number"] || "").trim() || undefined,
      admissionId: String(r.admissionId || r.admission || r["admission id"] || "").trim() || undefined,
      status: "ACTIVE",
    }));

    const valid = payloads.filter((p) => p.firstName && p.lastName && p.email && p.className);
    if (!valid.length) {
      toast.error("CSV must include firstName,lastName,email,className");
      return;
    }

    let created = 0;
    let failed = 0;

    for (const p of valid) {
      try {
        await apiRequest("/api/students", { method: "POST", body: p });
        created++;
      } catch {
        failed++;
      }
    }

    if (created) toast.success(`Imported ${created} students`);
    if (failed) toast.error(`${failed} students failed to import`);
    await loadStudents();
  }

  return (
    <div className="p-6 space-y-6">
      {/* --- HEADER SECTION (Fixed Layout) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student records and admissions.</p>
        </div>

        {/* Buttons Group - Always Visible */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Import Button */}
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={openImportPicker}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          
          {/* Export Button */}
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

          {/* Add Student (Primary Action) */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
              </DialogHeader>

              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateStudent)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First name</Label>
                      <Input {...createForm.register("firstName", { required: "First name is required" })} />
                      {createForm.formState.errors.firstName ? (
                        <div className="text-sm font-medium text-destructive">{String(createForm.formState.errors.firstName.message)}</div>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Last name</Label>
                      <Input {...createForm.register("lastName", { required: "Last name is required" })} />
                      {createForm.formState.errors.lastName ? (
                        <div className="text-sm font-medium text-destructive">{String(createForm.formState.errors.lastName.message)}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      {...createForm.register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.[^\s]+$/, message: "Invalid email" },
                      })}
                    />
                    {createForm.formState.errors.email ? (
                      <div className="text-sm font-medium text-destructive">{String(createForm.formState.errors.email.message)}</div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label>Initial password</Label>
                    <Input type="password" {...createForm.register("tempPassword", { required: "Password is required" })} />
                    {createForm.formState.errors.tempPassword ? (
                      <div className="text-sm font-medium text-destructive">
                        {String(createForm.formState.errors.tempPassword.message)}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Input {...createForm.register("className", { required: "Class is required" })} />
                    {createForm.formState.errors.className ? (
                      <div className="text-sm font-medium text-destructive">{String(createForm.formState.errors.className.message)}</div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone (optional)</Label>
                      <Input {...createForm.register("phone")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Roll no. (optional)</Label>
                      <Input {...createForm.register("rollNumber")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Admission ID (optional)</Label>
                    <Input {...createForm.register("admissionId")} />
                  </div>

                  {customFields.length ? (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Custom Fields</div>
                      {customFields.map((f) => (
                        <DynamicFieldRenderer<CreateStudentFormValues>
                          key={f._id}
                          field={f}
                          control={createForm.control}
                          name={`customFields.${f._id}`}
                        />
                      ))}
                    </div>
                  ) : null}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
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

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="flex items-center gap-2 bg-background/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Mobile-only Export/Import icons (Optional, if you want them on tiny screens) */}
        <div className="flex sm:hidden gap-1">
             <Button variant="ghost" size="icon" onClick={openImportPicker}><Upload className="h-4 w-4"/></Button>
             <Button variant="ghost" size="icon" onClick={handleExport}><Download className="h-4 w-4"/></Button>
        </div>
      </div>

      {/* --- STUDENTS LIST --- */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Loading students...</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">No students found.</CardContent>
          </Card>
        ) : (
          filtered.map((student) => (
            <Card key={student._id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="grid gap-1">
                  <div className="font-semibold flex items-center gap-2">
                    {student.firstName} {student.lastName}
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-muted-foreground">
                      {student.className || "-"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{student.email}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm hidden md:block text-right mr-4">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className={student.status === "ACTIVE" ? "text-green-600 font-medium" : "text-orange-600"}>
                      {student.status || "-"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(student)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/students/${student._id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete student?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the student.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteStudent(student)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateStudent)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input {...editForm.register("firstName", { required: "First name is required" })} />
                  {editForm.formState.errors.firstName ? (
                    <div className="text-sm font-medium text-destructive">{String(editForm.formState.errors.firstName.message)}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input {...editForm.register("lastName", { required: "Last name is required" })} />
                  {editForm.formState.errors.lastName ? (
                    <div className="text-sm font-medium text-destructive">{String(editForm.formState.errors.lastName.message)}</div>
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
                {editForm.formState.errors.email ? (
                  <div className="text-sm font-medium text-destructive">{String(editForm.formState.errors.email.message)}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Input {...editForm.register("className", { required: "Class is required" })} />
                {editForm.formState.errors.className ? (
                  <div className="text-sm font-medium text-destructive">{String(editForm.formState.errors.className.message)}</div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input {...editForm.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Roll no. (optional)</Label>
                  <Input {...editForm.register("rollNumber")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Admission ID (optional)</Label>
                <Input {...editForm.register("admissionId")} />
              </div>

              <div className="space-y-2">
                <Label>New Password (optional)</Label>
                <Input type="password" autoComplete="new-password" {...editForm.register("newPassword")} />
              </div>

              {customFields.length ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Custom Fields</div>
                  {customFields.map((f) => (
                    <DynamicFieldRenderer<EditStudentFormValues>
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

export default Students;