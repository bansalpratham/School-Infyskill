import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
};

export default function DynamicFieldRenderer<TFormValues extends { customFields?: Record<string, any> }>({
  field,
  control,
  name,
}: {
  field: CustomField;
  control: Control<TFormValues>;
  name: any;
}) {
  const rules: Record<string, any> = {};
  if (field.enabled && field.required) {
    rules.required = `${field.label} is required`;
  }

  if (field.type === "email") {
    rules.pattern = { value: /^\S+@\S+\.[^\s]+$/, message: "Invalid email" };
  }

  if (field.type === "phone") {
    rules.pattern = { value: /^[0-9+\-()\s]{7,20}$/, message: "Invalid phone" };
  }

  if (field.type === "number") {
    rules.validate = (v: any) => {
      if (v === undefined || v === null || v === "") return true;
      return Number.isFinite(Number(v)) || "Must be a number";
    };
  }

  if (!field.enabled) {
    return null;
  }

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field: rhfField }) => {
        if (field.type === "textarea") {
          return (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required ? " *" : ""}
              </FormLabel>
              <FormControl>
                <Textarea placeholder={field.placeholder || ""} {...rhfField} value={rhfField.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }

        if (field.type === "dropdown") {
          return (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required ? " *" : ""}
              </FormLabel>
              <Select value={String(rhfField.value ?? "")} onValueChange={(v) => rhfField.onChange(v)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || "Select"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(field.options || []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }

        if (field.type === "checkbox") {
          return (
            <FormItem className="flex items-center gap-3 space-y-0 rounded-md border p-3">
              <FormControl>
                <Checkbox checked={!!rhfField.value} onCheckedChange={(v) => rhfField.onChange(!!v)} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {field.label}
                  {field.required ? " *" : ""}
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          );
        }

        if (field.type === "date") {
          const dateValue: Date | null = rhfField.value ? new Date(rhfField.value) : null;

          return (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required ? " *" : ""}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dateValue && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateValue ? format(dateValue, "PPP") : field.placeholder || "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue ?? undefined}
                    onSelect={(d) => rhfField.onChange(d ? d.toISOString() : undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }

        const inputType = field.type === "email" ? "email" : field.type === "number" ? "number" : "text";

        return (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required ? " *" : ""}
            </FormLabel>
            <FormControl>
              <Input
                type={inputType}
                placeholder={field.placeholder || ""}
                {...rhfField}
                value={rhfField.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
