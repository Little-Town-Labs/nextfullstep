"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface TodoFormData {
  title: string;
  description: string;
  category: "ai_suggested" | "personal_upskilling" | "general";
  priority: "critical" | "high" | "normal" | "low";
  status: "pending" | "in_progress" | "completed" | "archived";
  dueDate: string;
  estimatedMinutes: string;
  tags: string;
  notes: string;
}

interface TodoFormProps {
  initialData?: Partial<TodoFormData>;
  todoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TodoForm({ initialData, todoId, onSuccess, onCancel }: TodoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TodoFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "personal_upskilling",
    priority: initialData?.priority || "normal",
    status: initialData?.status || "pending",
    dueDate: initialData?.dueDate 
      ? new Date(initialData.dueDate).toISOString().slice(0, 16) 
      : "",    estimatedMinutes: initialData?.estimatedMinutes || "",
    tags: initialData?.tags || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const apiData: any = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        priority: formData.priority,
        notes: formData.notes || undefined,
      };

      if (formData.dueDate) {
        const date = new Date(formData.dueDate);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid due date");
        }
        apiData.dueDate = date.toISOString();
      }

      if (formData.estimatedMinutes) {
        const minutes = parseInt(formData.estimatedMinutes, 10);
        if (isNaN(minutes) || minutes < 0) {
          throw new Error("Invalid estimated minutes");
        }
        apiData.estimatedMinutes = minutes;
      }

      if (formData.tags) {
        const tagArray = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        if (tagArray.length > 20) {
          throw new Error("Maximum 20 tags allowed");
        }
        apiData.tags = tagArray;
      }
      // Only include status for updates
      if (todoId) {
        apiData.status = formData.status;
      }

      // Make API request
      const url = todoId ? `/api/todos/${todoId}` : "/api/todos";
      const method = todoId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to save todo";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }
      // Success - navigate or call callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/todos");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Error saving todo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard/todos");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{todoId ? "Edit Todo" : "Create New Todo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Learn advanced TypeScript concepts"
              required
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of what needs to be done..."
              rows={4}
              maxLength={5000}
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="personal_upskilling">Personal Upskilling</option>
                <option value="ai_suggested">AI Suggested</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Status (only for editing) */}
          {todoId && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          {/* Due Date and Estimated Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Estimated Time (minutes)</Label>
              <Input
                id="estimatedMinutes"
                name="estimatedMinutes"
                type="number"
                value={formData.estimatedMinutes}
                onChange={handleChange}
                placeholder="120"
                min="0"
                max="10000"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="typescript, learning, programming"
            />
            <p className="text-xs text-gray-500">Separate tags with commas. Max 20 tags.</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes or thoughts..."
              rows={3}
              maxLength={5000}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || !formData.title}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {todoId ? "Update Todo" : "Create Todo"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
