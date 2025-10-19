import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserByClerkId } from "@/lib/subscription";
import { getRepository } from "@/lib/data-source";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2,
  Flame,
  Award,
  BarChart3,
  Clock
} from "lucide-react";

export default async function ProgressPage() {
  const { userId: clerkUserId } = await auth();
  const user = await currentUser();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Get user from database
  const dbUser = await getUserByClerkId(clerkUserId);

  if (!dbUser || !dbUser.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Fetch all user data for progress tracking
  const assessmentRepo = await getRepository(CareerAssessmentEntity);
  const roadmapRepo = await getRepository(RoadmapEntity);
  const todoRepo = await getRepository(UserTodoEntity);

  // Get assessments
  const completedAssessments = await assessmentRepo.find({
    where: { userId: clerkUserId, status: "completed" },
    order: { completedAt: "DESC" }
  });

  // Get roadmaps
  const allRoadmaps = await roadmapRepo.find({
    where: { userId: clerkUserId },
    order: { createdAt: "DESC" }
  });

  // Get todos
  const allTodos = await todoRepo.find({
    where: { userId: clerkUserId },
    order: { createdAt: "DESC" }
  });

  // Calculate progress metrics
  const totalRoadmaps = allRoadmaps.length;
  const activeRoadmaps = allRoadmaps.filter(r => r.status === "active" && r.progressPercentage < 100).length;
  const completedRoadmaps = allRoadmaps.filter(r => r.progressPercentage === 100).length;

  const totalTasks = allRoadmaps.reduce((sum, r) => sum + (r.totalTasks || 0), 0);
  const completedTasks = allRoadmaps.reduce((sum, r) => sum + (r.completedTasks || 0), 0);
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Todo statistics
  const completedTodos = allTodos.filter(t => t.status === "completed").length;
  const inProgressTodos = allTodos.filter(t => t.status === "in_progress").length;
  const pendingTodos = allTodos.filter(t => t.status === "pending").length;
  const todoCompletionRate = allTodos.length > 0
    ? Math.round((completedTodos / allTodos.length) * 100)
    : 0;

  // Streaks and activity
  const longestStreak = Math.max(...allRoadmaps.map(r => r.longestStreak || 0), 0);
  const currentStreak = Math.max(...allRoadmaps.map(r => r.currentStreak || 0), 0);

  // Average assessment scores
  const avgScore = completedAssessments.length > 0
    ? Math.round(
        completedAssessments.reduce((sum, a) => sum + (a.verdictScore || 0), 0) /
        completedAssessments.length
      )
    : 0;

  // Days active (since first roadmap)
  const firstRoadmap = allRoadmaps.length > 0
    ? allRoadmaps[allRoadmaps.length - 1]
    : null;
  const daysActive = firstRoadmap
    ? Math.floor((Date.now() - new Date(firstRoadmap.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Recent activity timeline (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Progress Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Track your career transformation journey
          </p>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Overall Progress</CardDescription>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{tasksProgress}%</div>
              <Progress value={tasksProgress} className="mb-2" />
              <p className="text-sm text-gray-600">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Current Streak</CardDescription>
                <Flame className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{currentStreak}</div>
              <p className="text-sm text-gray-600">
                days of consistent work
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Longest: {longestStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active Roadmaps</CardDescription>
                <Target className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{activeRoadmaps}</div>
              <p className="text-sm text-gray-600">
                {completedRoadmaps} completed, {totalRoadmaps} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Days Active</CardDescription>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{daysActive}</div>
              <p className="text-sm text-gray-600">
                since you started your journey
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Roadmap Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Roadmap Progress
              </CardTitle>
              <CardDescription>Your career transformation roadmaps</CardDescription>
            </CardHeader>
            <CardContent>
              {allRoadmaps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No roadmaps yet</p>
                  <Link href="/careers">
                    <Button variant="outline" size="sm">
                      Start Your First Assessment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {allRoadmaps.slice(0, 5).map((roadmap) => (
                    <div key={roadmap.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{roadmap.roleName}</h4>
                          {roadmap.progressPercentage === 100 && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {roadmap.progressPercentage}%
                        </span>
                      </div>
                      <Progress value={roadmap.progressPercentage} className="mb-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {roadmap.completedTasks} / {roadmap.totalTasks} tasks
                        </span>
                        <Link href={`/roadmap/${roadmap.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {allRoadmaps.length > 5 && (
                    <Link href="/dashboard/roadmaps">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Roadmaps ({allRoadmaps.length})
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Todo Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Todo Statistics
              </CardTitle>
              <CardDescription>Your personal productivity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-2xl font-bold text-blue-600">{todoCompletionRate}%</span>
                  </div>
                  <Progress value={todoCompletionRate} className="mb-2" />
                  <p className="text-xs text-gray-600">
                    {completedTodos} of {allTodos.length} todos completed
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{pendingTodos}</div>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{inProgressTodos}</div>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{completedTodos}</div>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>

                <Link href="/dashboard/todos">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Manage Todos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History & Achievements */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Assessment History
              </CardTitle>
              <CardDescription>Your career evaluation journey</CardDescription>
            </CardHeader>
            <CardContent>
              {completedAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No assessments completed yet</p>
                  <Link href="/careers">
                    <Button variant="outline" size="sm">
                      Take Your First Assessment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">Average Score</div>
                    <div className="text-3xl font-bold text-blue-600">{avgScore}%</div>
                  </div>
                  <div className="space-y-2">
                    {completedAssessments.slice(0, 3).map((assessment) => (
                      <div key={assessment.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm">{assessment.roleName}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(assessment.completedAt || assessment.startedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {assessment.verdictScore}%
                            </div>
                            <Link href={`/assessment/${assessment.id}/results`}>
                              <Button variant="ghost" size="sm" className="h-6 text-xs">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {completedAssessments.length > 3 && (
                    <Link href="/dashboard/assessments">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Assessments ({completedAssessments.length})
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements & Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
              <CardDescription>Your career transformation milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Achievement badges */}
                {completedAssessments.length >= 1 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">First Assessment</h4>
                      <p className="text-xs text-gray-600">Completed your first career assessment</p>
                    </div>
                  </div>
                )}

                {completedTasks >= 10 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                      10
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Task Warrior</h4>
                      <p className="text-xs text-gray-600">Completed 10 roadmap tasks</p>
                    </div>
                  </div>
                )}

                {longestStreak >= 7 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                      🔥
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Week Streak</h4>
                      <p className="text-xs text-gray-600">Maintained a 7-day streak</p>
                    </div>
                  </div>
                )}

                {completedRoadmaps >= 1 && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                      🎯
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Roadmap Complete</h4>
                      <p className="text-xs text-gray-600">Finished your first roadmap</p>
                    </div>
                  </div>
                )}

                {/* Show encouragement if no achievements yet */}
                {completedAssessments.length === 0 && completedTasks === 0 && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Start your journey to unlock achievements!</p>
                    <Link href="/careers">
                      <Button variant="outline" size="sm">
                        Take Assessment
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
