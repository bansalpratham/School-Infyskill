import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export type CustomFieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "date";

export type CustomFieldVisibility = "student" | "teacher" | "both";

export type CustomField = {
  _id: string;
  label: string;
  placeholder?: string;
  type: CustomFieldType;
  required: boolean;
  options: string[];
  visibility: CustomFieldVisibility;
  order: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type FieldPayload = {
  label: string;
  placeholder?: string;
  type: CustomFieldType;
  required: boolean;
  options: string[];
  visibility: CustomFieldVisibility;
  enabled: boolean;
};

function SortableRow({
  field,
  onEdit,
  onDelete,
  onToggleRequired,
  onToggleEnabled,
}: {
  field: CustomField;
  onEdit: (f: CustomField) => void;
  onDelete: (f: CustomField) => void;
  onToggleRequired: (f: CustomField, next: boolean) => void;
  onToggleEnabled: (f: CustomField, next: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field._id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab text-muted-foreground"
            {...attributes}
            {...listeners}
            aria-label="Drag"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="font-medium truncate">{field.label}</div>
            {field.placeholder ? (
              <div className="text-xs text-muted-foreground truncate">{field.placeholder}</div>
            ) : null}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="secondary">{field.type}</Badge>
      </TableCell>

      <TableCell>
        <Badge variant="outline">{field.visibility}</Badge>
      </TableCell>

      <TableCell>
        <Switch checked={!!field.required} onCheckedChange={(next) => onToggleRequired(field, !!next)} disabled={!field.enabled} />
      </TableCell>

      <TableCell>
        <Switch checked={!!field.enabled} onCheckedChange={(next) => onToggleEnabled(field, !!next)} />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => onEdit(field)}>
            <Pencil className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete field?</AlertDialogTitle>
                <AlertDialogDescription>This will remove the field definition.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(field)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function FieldDialog({
  title,
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
  remaining,
}: {
  title: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: FieldPayload;
  onSubmit: (payload: FieldPayload) => void;
  submitting: boolean;
  remaining: number;
}) {
  const [label, setLabel] = useState(initial.label);
  const [placeholder, setPlaceholder] = useState(initial.placeholder || "");
  const [type, setType] = useState<CustomFieldType>(initial.type);
  const [required, setRequired] = useState<boolean>(!!initial.required);
  const [visibility, setVisibility] = useState<CustomFieldVisibility>(initial.visibility);
  const [enabled, setEnabled] = useState<boolean>(!!initial.enabled);
  const [optionsText, setOptionsText] = useState<string>((initial.options || []).join("\n"));

  useEffect(() => {
    if (!open) return;
    setLabel(initial.label);
    setPlaceholder(initial.placeholder || "");
    setType(initial.type);
    setRequired(!!initial.required);
    setVisibility(initial.visibility);
    setEnabled(!!initial.enabled);
    setOptionsText((initial.options || []).join("\n"));
  }, [open, initial]);

  const options = useMemo(() => {
    if (type !== "dropdown") return [];
    return optionsText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [optionsText, type]);

  const canSubmit = label.trim().length > 0 && (type !== "dropdown" || options.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Field Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CustomFieldType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">text</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="email">email</SelectItem>
                  <SelectItem value="phone">phone</SelectItem>
                  <SelectItem value="textarea">textarea</SelectItem>
                  <SelectItem value="dropdown">dropdown</SelectItem>
                  <SelectItem value="checkbox">checkbox</SelectItem>
                  <SelectItem value="date">date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as CustomFieldVisibility)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">student</SelectItem>
                  <SelectItem value="teacher">teacher</SelectItem>
                  <SelectItem value="both">both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "dropdown" ? (
            <div className="space-y-2">
              <Label>Options</Label>
              <Textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Option 1\nOption 2\nOption 3"
              />
              <div className="text-xs text-muted-foreground">
                {options.length ? `${options.length} options` : "Add at least 1 option"}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Required</div>
              <div className="text-sm text-muted-foreground">Must be filled in the form</div>
            </div>
            <Switch checked={required} onCheckedChange={(v) => setRequired(!!v)} disabled={!enabled} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enabled</div>
              <div className="text-sm text-muted-foreground">Disable without deleting</div>
            </div>
            <Switch checked={enabled} onCheckedChange={(v) => setEnabled(!!v)} />
          </div>

          <div className="text-sm text-muted-foreground">
            Remaining enabled fields allowed: <span className="font-medium">{remaining}</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() =>
              onSubmit({
                label: label.trim(),
                placeholder: placeholder.trim() || undefined,
                type,
                required,
                options,
                visibility,
                enabled,
              })
            }
            disabled={submitting || !canSubmit}
          >
            {submitting ? "Creating..." : "Create Field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomFieldsManager() {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<CustomField[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<CustomField | null>(null);

  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const enabledCount = useMemo(() => fields.filter((f) => f.enabled).length, [fields]);
  const remaining = Math.max(15 - enabledCount, 0);

  async function load() {
    setLoading(true);
    try {
      const res = await apiRequest<any>("/api/custom-fields");
      const items: CustomField[] = Array.isArray(res?.data) ? res.data : [];
      setFields(items);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load custom fields");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(payload: FieldPayload) {
    if (fields.length >= 15) {
      toast.error("Maximum 15 custom fields allowed");
      return;
    }
    if (payload.enabled && remaining <= 0) {
      toast.error("Maximum 15 custom fields allowed");
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest<any>("/api/custom-fields", {
        method: "POST",
        body: payload,
      });
      const created = res?.data as CustomField;
      setFields((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      setAddOpen(false);
      toast.success("Field created");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create field");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(payload: FieldPayload) {
    if (!editing) return;

    if (payload.enabled && !editing.enabled && remaining <= 0) {
      toast.error("Maximum 15 custom fields allowed");
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest<any>(`/api/custom-fields/${editing._id}` , {
        method: "PUT",
        body: payload,
      });
      const updated = res?.data as CustomField;
      setFields((prev) => prev.map((f) => (f._id === updated._id ? updated : f)).sort((a, b) => a.order - b.order));
      setEditOpen(false);
      setEditing(null);
      toast.success("Field updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update field");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(field: CustomField) {
    setSaving(true);
    try {
      await apiRequest<any>(`/api/custom-fields/${field._id}`, { method: "DELETE" });
      setFields((prev) => prev.filter((f) => f._id !== field._id));
      toast.success("Field deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete field");
    } finally {
      setSaving(false);
    }
  }

  async function persistOrder(next: CustomField[]) {
    try {
      await apiRequest<any>("/api/custom-fields/reorder", {
        method: "PUT",
        body: { ids: next.map((x) => x._id) },
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to reorder fields");
    }
  }

  async function onDragEnd(evt: DragEndEvent) {
    const { active, over } = evt;
    if (!over) return;
    if (active.id === over.id) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((x) => x._id === active.id);
      const newIndex = prev.findIndex((x) => x._id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const next = arrayMove(prev, oldIndex, newIndex).map((f, idx) => ({ ...f, order: idx + 1 }));
      void persistOrder(next);
      return next;
    });
  }

  async function toggleRequired(field: CustomField, next: boolean) {
    setFields((prev) => prev.map((f) => (f._id === field._id ? { ...f, required: next } : f)));
    try {
      await apiRequest<any>(`/api/custom-fields/${field._id}`, { method: "PUT", body: { required: next } });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update required");
      await load();
    }
  }

  async function toggleEnabled(field: CustomField, next: boolean) {
    if (next && !field.enabled && remaining <= 0) {
      toast.error("Maximum 15 custom fields allowed");
      return;
    }

    setFields((prev) => prev.map((f) => (f._id === field._id ? { ...f, enabled: next, required: next ? f.required : false } : f)));
    try {
      await apiRequest<any>(`/api/custom-fields/${field._id}`, {
        method: "PUT",
        body: { enabled: next, ...(next ? {} : { required: false }) },
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update enabled");
      await load();
    }
  }

  const addInitial: FieldPayload = {
    label: "",
    placeholder: "",
    type: "text",
    required: false,
    options: [],
    visibility: "both",
    enabled: true,
  };

  const editInitial: FieldPayload = {
    label: editing?.label || "",
    placeholder: editing?.placeholder || "",
    type: editing?.type || "text",
    required: !!editing?.required,
    options: Array.isArray(editing?.options) ? editing!.options : [],
    visibility: editing?.visibility || "both",
    enabled: editing ? !!editing.enabled : true,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-bold tracking-tight">Custom Fields</div>
          <div className="text-sm text-muted-foreground">
            Create additional fields that will appear in Student and Teacher forms.
          </div>
        </div>

        <Button type="button" onClick={() => setAddOpen(true)} disabled={fields.length >= 15}>
          <Plus className="h-4 w-4 mr-2" /> Add Field
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : fields.length === 0 ? (
            <div className="text-sm text-muted-foreground">No custom fields yet.</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={fields.map((f) => f._id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Label</TableHead>
                      <TableHead>Field Type</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((f) => (
                      <SortableRow
                        key={f._id}
                        field={f}
                        onEdit={(x) => {
                          setEditing(x);
                          setEditOpen(true);
                        }}
                        onDelete={handleDelete}
                        onToggleRequired={toggleRequired}
                        onToggleEnabled={toggleEnabled}
                      />
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Total fields: <span className="font-medium">{fields.length}</span>/15
          </div>
        </CardContent>
      </Card>

      <FieldDialog
        title="Add Field"
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={addInitial}
        onSubmit={handleAdd}
        submitting={saving}
        remaining={remaining}
      />

      <FieldDialog
        title="Edit Field"
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditing(null);
        }}
        initial={editInitial}
        onSubmit={handleEdit}
        submitting={saving}
        remaining={remaining + (editing?.enabled ? 0 : 1)}
      />
    </div>
  );
}
