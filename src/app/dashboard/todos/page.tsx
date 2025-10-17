"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit,
  Calendar
} from "lucide-react";

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear timeout if value changes before delay
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  category: "ai_suggested" | "personal_upskilling" | "general";
  priority: "critical" | "high" | "normal" | "low";
  status: "pending" | "in_progress" | "completed" | "archived";
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  estimatedMinutes?: number;
  linkedToRoadmapId?: string;
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

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // Debounce search query to avoid API calls on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("limit", "100");

      const response = await fetch(`/api/todos?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch todos");
      }
      const data = await response.json();
      setTodos(data.data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      // Add toast notification here
      // toast.error(error instanceof Error ? error.message : "Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, categoryFilter, debouncedSearchQuery, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/todos/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.data);
      setStatsError(null); // Clear error on success
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStatsError("Unable to load statistics. Please try refreshing the page.");
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos, fetchStats]);

  const toggleTodoStatus = async (todoId: string, currentStatus: string) => {
    // Don't allow toggling archived todos
    if (currentStatus === "archived") {
      return;
    }

    setUpdating(todoId);
    try {
      // Define status workflow: pending -> in_progress -> completed -> pending
      let newStatus: string;
      switch (currentStatus) {
        case "pending":
          newStatus = "in_progress";
          break;
        case "in_progress":
          newStatus = "completed";
          break;
        case "completed":
          newStatus = "pending";
          break;
        default:
          newStatus = currentStatus;
      }

      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      await fetchTodos();
      await fetchStats();
    } catch (error) {
      console.error("Error updating todo:", error);
    } finally {
      setUpdating(null);
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!confirm("Are you sure you want to archive this todo?")) return;

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      await fetchTodos();
      await fetchStats();
    } catch (error) {
      console.error("Error deleting todo:", error);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai_suggested":
        return "bg-purple-100 text-purple-800";
      case "personal_upskilling":
        return "bg-green-100 text-green-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTodos = todos;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
              <p className="text-gray-600 mt-2">
                Track your upskilling tasks and learning goals
              </p>
            </div>
            <Link href="/dashboard/todos/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Todo
              </Button>
            </Link>
          </div>

          {/* Stats Error Alert */}
          {statsError && (
            <div
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Statistics Error</p>
                <p className="text-sm text-red-700 mt-1">{statsError}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchStats}
                className="text-red-700 hover:text-red-800 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Stats Cards */}
          {stats && !statsError && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <p className="text-xs text-gray-600">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                  <p className="text-xs text-gray-600">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                  <p className="text-xs text-gray-600">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <p className="text-xs text-gray-600">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                  <p className="text-xs text-gray-600">Overdue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                  <p className="text-xs text-gray-600">Completion</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search todos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="ai_suggested">AI Suggested</option>
                <option value="personal_upskilling">Personal Upskilling</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex gap-4 mt-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "ASC" ? "Ascending" : "Descending"}
              </Button>

              {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Todo List */}
        <Card>
          <CardHeader>
            <CardTitle>Todos ({filteredTodos.length})</CardTitle>
            <CardDescription>
              {statusFilter !== "all" && `Filtered by ${statusFilter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No todos found</p>
                <p className="text-sm text-gray-400 mb-6">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first todo to get started"}
                </p>
                <Link href="/dashboard/todos/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Todo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                      todo.status === "completed" ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Checkbox
                      checked={todo.status === "completed"}
                      onCheckedChange={() => toggleTodoStatus(todo.id, todo.status)}
                      disabled={updating === todo.id || todo.status === "archived"}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              todo.status === "completed"
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Badge>
                          <Badge className={getCategoryColor(todo.category)}>
                            {todo.category.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {todo.dueDate && (
                          <div className="flex items-center gap-1">
                            {isOverdue(todo.dueDate) && todo.status !== "completed" ? (
                              <>
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">
                                  Overdue: {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3 w-3" />
                                <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        )}

                        {todo.estimatedMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{todo.estimatedMinutes} min</span>
                          </div>
                        )}

                        {todo.tags.length > 0 && (
                          <div className="flex gap-1">
                            {todo.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {todo.tags.length > 3 && (
                              <span className="text-gray-400">+{todo.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/dashboard/todos/${todo.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
