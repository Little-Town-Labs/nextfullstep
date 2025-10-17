"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { TodoForm } from "@/components/todos/TodoForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  description?: string;
  category: "ai_suggested" | "personal_upskilling" | "general";
  priority: "critical" | "high" | "normal" | "low";
  status: "pending" | "in_progress" | "completed" | "archived";
  dueDate?: string;
  estimatedMinutes?: number;
  tags: string[];
  notes?: string;
}

export default function EditTodoPage() {
  const params = useParams();
  const router = useRouter();
  const todoId = typeof params.id === 'string' ? params.id : '';

  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTodo = useCallback(async () => {
    if (!todoId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/todos/${todoId}`);
      if (!response.ok) throw new Error("Failed to fetch todo");
      const data = await response.json();

      // Validate API response shape
      if (
        typeof data !== "object" ||
        data === null ||
        !("data" in data) ||
        data.data == null
      ) {
        console.error("Invalid API response shape:", data);
        throw new Error("Invalid response format from server");
      }

      // Validate expected fields on data.data
      const todo = data.data;
      if (
        typeof todo !== "object" ||
        !todo.id ||
        !todo.title ||
        !todo.category ||
        !todo.priority ||
        !todo.status
      ) {
        console.error("Invalid todo object structure:", todo);
        throw new Error("Todo object missing required fields");
      }

      setTodo(data.data);
    } catch (error) {
      console.error("Error fetching todo:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    fetchTodo();
  }, [fetchTodo]);

  if (!todoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Todo ID</h2>
          <Link href="/dashboard/todos">
            <Button>Back to Todos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this todo?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/todos/${todoId}?permanent=true`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      router.push("/dashboard/todos");
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading todo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Todo</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchTodo}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Link href="/dashboard/todos">
              <Button variant="outline">Back to Todos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Todo Not Found</h2>
          <p className="text-gray-600 mb-6">
            The todo you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard/todos">
            <Button>Back to Todos</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format data for form
  const formData = {
    title: todo.title,
    description: todo.description || "",
    category: todo.category,
    priority: todo.priority,
    status: todo.status,
    dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : "",
    estimatedMinutes: todo.estimatedMinutes?.toString() || "",
    tags: todo.tags.join(", "),
    notes: todo.notes || "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Back Button */}
        <Link
          href="/dashboard/todos"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Todos
        </Link>

        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Todo</h1>
            <p className="text-gray-600 mt-2">Update your task details</p>
          </div>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>

        {/* Form */}
        <TodoForm initialData={formData} todoId={todoId} />
      </div>
    </div>
  );
}
