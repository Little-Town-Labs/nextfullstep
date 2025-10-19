"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle2, Clock, ExternalLink, Target, TrendingUp, ListTodo } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  status: "pending" | "in_progress" | "completed" | "skipped";
  estimatedHours?: number;
  resources?: string[];
  targetDate?: string;
  completedAt?: string;
  notes?: string;
}

interface Phase {
  phaseId: string;
  phaseName: string;
  tasks: Task[];
}

interface Roadmap {
  id: string;
  userId: string;
  assessmentId: string;
  roleId: string;
  roleName: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  targetCompletionDate?: string;
  createdAt: string;
  phases: Phase[];
}

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = params.roadmapId as string;

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [convertingTask, setConvertingTask] = useState<string | null>(null);
  const [convertingPhase, setConvertingPhase] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapId]);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`/api/roadmap?id=${roadmapId}`);
      const data = await res.json();

      if (data.success) {
        setRoadmap(data.roadmap);
      } else {
        console.error("Failed to fetch roadmap:", data.error);
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (task: Task) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(task.id)) {
        next.delete(task.id);
      } else {
        next.add(task.id);
      }
      return next;
    });
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/roadmap/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        // Refresh roadmap to show updated progress
        await fetchRoadmap();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const saveTaskNotes = async (taskId: string) => {
    try {
      const res = await fetch(`/api/roadmap/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: noteText }),
      });

      if (res.ok) {
        setEditingNotes(null);
        await fetchRoadmap();
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const convertToTodo = async (taskId: string) => {
    setConvertingTask(taskId);
    try {
      const response = await fetch("/api/todos/from-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapTaskId: taskId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Todo created successfully! View it in your Todos page.");
        await fetchRoadmap(); // Refresh to reflect any state changes
      } else if (response.status === 409) {
        toast.info("A todo already exists for this task.");
      } else {
        throw new Error(data.error || "Failed to create todo");
      }
    } catch (error) {
      console.error("Error converting to todo:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Failed to create todo: " + message);
    } finally {
      setConvertingTask(null);
    }
  };

  const convertPhaseToTodos = async (phase: Phase) => {
    setConvertingPhase(phase.phaseId);

    // Only convert incomplete tasks
    const incompleteTasks = phase.tasks.filter(t => t.status !== "completed");

    if (incompleteTasks.length === 0) {
      toast.info("All tasks in this phase are already completed!");
      setConvertingPhase(null);
      return;
    }

    try {
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      // Convert tasks in parallel
      const results = await Promise.allSettled(
        incompleteTasks.map(task =>
          fetch("/api/todos/from-roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roadmapTaskId: task.id }),
          }).then(res => res.json())
        )
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            successCount++;
          } else if (result.value.error?.includes("already exists")) {
            skipCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      });

      // Show summary toast
      if (successCount > 0) {
        toast.success(`Created ${successCount} todo${successCount > 1 ? 's' : ''} from ${phase.phaseName}!`);
      }
      if (skipCount > 0) {
        toast.info(`Skipped ${skipCount} task${skipCount > 1 ? 's' : ''} (already converted)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to convert ${errorCount} task${errorCount > 1 ? 's' : ''}`);
      }

      await fetchRoadmap(); // Refresh
    } catch (error) {
      console.error("Error converting phase to todos:", error);
      toast.error("Failed to convert phase tasks to todos");
    } finally {
      setConvertingPhase(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "NORMAL":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "LOW":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPhaseColor = (phaseId: string) => {
    switch (phaseId) {
      case "immediate":
        return "border-l-4 border-l-purple-500";
      case "short_term":
        return "border-l-4 border-l-blue-500";
      case "mid_term":
        return "border-l-4 border-l-green-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Roadmap Not Found</CardTitle>
            <CardDescription>
              The roadmap you&apos;re looking for doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/careers")}>
              Back to Careers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Career Roadmap
              </h1>
              <p className="text-xl text-gray-600">{roadmap.roleName}</p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/assessment/${roadmap.assessmentId}/results`)
              }
            >
              View Assessment
            </Button>
          </div>

          {/* Progress Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5" />
                    <p className="text-sm font-medium opacity-90">Progress</p>
                  </div>
                  <p className="text-3xl font-bold">
                    {roadmap.progressPercentage}%
                  </p>
                  <Progress
                    value={roadmap.progressPercentage}
                    className="mt-2 bg-white/20"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-medium opacity-90">Tasks</p>
                  </div>
                  <p className="text-3xl font-bold">
                    {roadmap.completedTasks}/{roadmap.totalTasks}
                  </p>
                  <p className="text-sm opacity-75 mt-1">completed</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <p className="text-sm font-medium opacity-90">
                      Current Streak
                    </p>
                  </div>
                  <p className="text-3xl font-bold">{roadmap.currentStreak}</p>
                  <p className="text-sm opacity-75 mt-1">
                    days (best: {roadmap.longestStreak})
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5" />
                    <p className="text-sm font-medium opacity-90">
                      Days Active
                    </p>
                  </div>
                  <p className="text-3xl font-bold">{roadmap.daysActive}</p>
                  <p className="text-sm opacity-75 mt-1">
                    since {new Date(roadmap.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phases */}
        {!roadmap.phases || roadmap.phases.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="py-8 text-center text-gray-500">
              <p>No phases found in this roadmap.</p>
              <p className="text-sm mt-2">This might indicate a data issue. Check the browser console for details.</p>
            </CardContent>
          </Card>
        ) : null}
        {roadmap.phases?.map((phase) => {
          const completedInPhase = phase.tasks.filter(
            (t) => t.status === "completed"
          ).length;
          const phaseProgress = Math.round(
            (completedInPhase / phase.tasks.length) * 100
          );

          return (
            <Card
              key={phase.phaseId}
              className={`mb-6 ${getPhaseColor(phase.phaseId)}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{phase.phaseName}</CardTitle>
                    <CardDescription>
                      {completedInPhase} of {phase.tasks.length} tasks completed
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {phaseProgress}%
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => convertPhaseToTodos(phase)}
                      disabled={convertingPhase === phase.phaseId}
                      className="gap-2"
                    >
                      <ListTodo className="h-4 w-4" />
                      {convertingPhase === phase.phaseId
                        ? "Converting..."
                        : "Convert Phase to Todos"}
                    </Button>
                  </div>
                </div>
                <Progress value={phaseProgress} className="mt-2" />
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {phase.tasks.map((task) => {
                    const isExpanded = expandedTasks.has(task.id);
                    const isEditingThisTask = editingNotes === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-4 transition-all ${
                          task.status === "completed"
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={task.status === "completed"}
                            onCheckedChange={(checked) => {
                              updateTaskStatus(
                                task.id,
                                checked ? "completed" : "pending"
                              );
                            }}
                            className="mt-1"
                          />

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    task.status === "completed"
                                      ? "line-through text-gray-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {task.title}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getPriorityColor(task.priority)}
                                >
                                  {task.priority}
                                </Badge>
                                {task.estimatedHours && (
                                  <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.estimatedHours}h
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTask(task)}
                                >
                                  {isExpanded ? "Less" : "More"}
                                </Button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 space-y-3 text-sm">
                                {task.description && (
                                  <p className="text-gray-600">
                                    {task.description}
                                  </p>
                                )}

                                {task.resources && task.resources.length > 0 && (
                                  <div>
                                    <p className="font-medium text-gray-700 mb-1">
                                      Resources:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {task.resources.map((resource, idx) => (
                                        <a
                                          key={idx}
                                          href={resource}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          Link {idx + 1}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {task.completedAt && (
                                  <p className="text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed on{" "}
                                    {new Date(task.completedAt).toLocaleDateString()}
                                  </p>
                                )}

                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-gray-700">
                                      Notes:
                                    </p>
                                    {!isEditingThisTask && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingNotes(task.id);
                                          setNoteText(task.notes || "");
                                        }}
                                      >
                                        {task.notes ? "Edit" : "Add"}
                                      </Button>
                                    )}
                                  </div>

                                  {isEditingThisTask ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={noteText}
                                        onChange={(e) =>
                                          setNoteText(e.target.value)
                                        }
                                        placeholder="Add notes about this task..."
                                        className="min-h-[80px]"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => saveTaskNotes(task.id)}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingNotes(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-600 italic">
                                      {task.notes || "No notes yet"}
                                    </p>
                                  )}
                                </div>

                                {/* Convert to Todo Button */}
                                <div className="pt-2 border-t">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => convertToTodo(task.id)}
                                    disabled={convertingTask === task.id}
                                    className="w-full"
                                  >
                                    <ListTodo className="h-4 w-4 mr-2" />
                                    {convertingTask === task.id
                                      ? "Creating Todo..."
                                      : "Convert to Personal Todo"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Footer Actions */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.push("/careers")}
          >
            Explore Other Roles
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
