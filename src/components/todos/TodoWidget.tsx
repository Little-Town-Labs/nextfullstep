"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: "critical" | "high" | "normal" | "low";
  status: string;
  dueDate?: string;
  completedAt?: string;
}

interface TodoStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueThisWeek: number;
  completionRate: number;
}

export function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos?status=pending&status=in_progress&limit=5&sortBy=dueDate&sortOrder=ASC");
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      setTodos(data.data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/todos/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const toggleTodoComplete = async (todoId: string, currentStatus: string) => {
    setUpdating(todoId);
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      // Refresh data
      await fetchTodos();
      await fetchStats();
    } catch (error) {
      console.error("Error updating todo:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Todos</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Todos</CardTitle>
            <CardDescription>Track your upskilling tasks</CardDescription>
          </div>
          <Link href="/dashboard/todos">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.pending + stats.inProgress}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
          </div>
        )}

        {/* Todo List */}
        {todos.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No pending todos!</p>
            <p className="text-sm text-gray-400 mb-4">
              Create tasks to track your upskilling progress
            </p>
            <Link href="/dashboard/todos">
              <Button size="sm">Create Todo</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={todo.status === "completed"}
                  onCheckedChange={() => toggleTodoComplete(todo.id, todo.status)}
                  disabled={updating === todo.id}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-medium truncate ${todo.status === "completed" ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {todo.title}
                    </p>
                    <Badge className={`${getPriorityColor(todo.priority)} text-xs shrink-0`}>
                      {todo.priority}
                    </Badge>
                  </div>
                  {todo.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {isOverdue(todo.dueDate) ? (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-600">
                            Overdue {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Due {new Date(todo.dueDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Link href="/dashboard/todos" className="block">
              <Button variant="ghost" size="sm" className="w-full">
                View All Todos →
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
