import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserByClerkId } from "@/lib/subscription";
import { AppDataSource } from "@/lib/data-source";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoWidget } from "@/components/todos/TodoWidget";

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  const user = await currentUser();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Get user from database
  const dbUser = await getUserByClerkId(clerkUserId);

  if (!dbUser) {
    // User not yet synced from webhook, show loading state
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Setting up your account...</h1>
          <p className="text-gray-600">Please wait while we prepare your dashboard.</p>
        </div>
      </div>
    );
  }

  // Check if onboarding is complete
  if (!dbUser.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Fetch user's assessments
  // Database is already initialized in middleware at startup
  const assessmentRepo = AppDataSource.getRepository(CareerAssessmentEntity);

  // Get recent assessments for display
  const assessments = await assessmentRepo.find({
    where: { userId: clerkUserId },
    order: { startedAt: "DESC" },
    take: 5,
  });

  // Get total completed assessments count
  const completedAssessments = await assessmentRepo.count({
    where: { userId: clerkUserId, status: "completed" }
  });

  const roadmapRepo = AppDataSource.getRepository(RoadmapEntity);
  const roadmaps = await roadmapRepo.find({
    where: { userId: clerkUserId },
    order: { createdAt: "DESC" },
    take: 5,
  });
  const totalRoadmaps = roadmaps.length;
  const activeRoadmaps = roadmaps.filter((r) => r.progressPercentage < 100).length;

  // Calculate total tasks completed across all roadmaps
  const totalTasksCompleted = roadmaps.reduce((sum, r) => sum + (r.completedTasks || 0), 0);

  // Get subscription tier display
  const tierDisplay = {
    free: { name: "Free", color: "text-gray-600", bg: "bg-gray-100" },
    pro: { name: "Pro", color: "text-blue-600", bg: "bg-blue-100" },
    enterprise: { name: "Enterprise", color: "text-purple-600", bg: "bg-purple-100" },
  }[dbUser.subscriptionTier] || { name: "Free", color: "text-gray-600", bg: "bg-gray-100" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "there"}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s your career transformation progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Subscription</CardDescription>
              <CardTitle className="text-2xl">
                <span className={`${tierDisplay.bg} ${tierDisplay.color} px-3 py-1 rounded-full text-sm font-semibold`}>
                  {tierDisplay.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbUser.subscriptionTier === "free" && (
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="w-full">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Assessments</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {completedAssessments}
                <span className="text-lg text-gray-500 font-normal">
                  {dbUser.subscriptionTier === "free" ? ` / ${dbUser.assessmentsLimit}` : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {completedAssessments} total completed assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Roadmaps</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {activeRoadmaps}
                <span className="text-lg text-gray-500 font-normal">
                  {dbUser.subscriptionTier === "free" ? ` / ${dbUser.roadmapsLimit}` : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {totalRoadmaps} total roadmaps
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tasks Completed</CardDescription>
              <CardTitle className="text-3xl font-bold">{totalTasksCompleted}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Keep up the momentum!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your career transformation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/careers">
                <Button>
                  Take New Assessment
                </Button>
              </Link>
              {roadmaps.length > 0 && (
                <Link href={`/roadmap/${roadmaps[0].id}`}>
                  <Button variant="outline">
                    Continue Latest Roadmap
                  </Button>
                </Link>
              )}
              <Link href="/dashboard/settings">
                <Button variant="outline">
                  Account Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Assessments, Roadmaps & Todos */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Your latest career evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No assessments yet</p>
                  <Link href="/careers">
                    <Button variant="outline" size="sm">
                      Take Your First Assessment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {assessment.roleName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {assessment.status === "completed" ? (
                            <>
                              Completed • Score: {assessment.verdictScore}%
                              {assessment.verdictTier && (
                                <span className="ml-2 font-medium">
                                  {assessment.verdictTier === "QUALIFIED_NOW" && "✅ Qualified"}
                                  {assessment.verdictTier === "NEARLY_QUALIFIED" && "⚡ Nearly Qualified"}
                                  {assessment.verdictTier === "SIGNIFICANT_GAPS" && "📚 Significant Gaps"}
                                  {assessment.verdictTier === "NOT_VIABLE" && "🔄 Not Viable"}
                                </span>
                              )}
                            </>
                          ) : (
                            `In Progress • ${assessment.currentQuestionNumber}/8 questions`
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(assessment.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={
                          assessment.status === "completed"
                            ? `/assessment/${assessment.id}/results`
                            : `/assessment/start/${assessment.roleId}`
                        }
                      >
                        <Button variant="ghost" size="sm">
                          {assessment.status === "completed" ? "View Results" : "Continue"}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Roadmaps */}
          <Card>
            <CardHeader>
              <CardTitle>Your Roadmaps</CardTitle>
              <CardDescription>Track your progress towards your goals</CardDescription>
            </CardHeader>
            <CardContent>
              {roadmaps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No roadmaps yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Complete an assessment to get your personalized roadmap
                  </p>
                  <Link href="/careers">
                    <Button variant="outline" size="sm">
                      Start Assessment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {roadmaps.map((roadmap) => (
                    <div
                      key={roadmap.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {roadmap.roleName}
                        </h4>
                        <span className="text-sm font-medium text-blue-600">
                          {roadmap.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${roadmap.progressPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {roadmap.completedTasks} / {roadmap.totalTasks} tasks completed
                        </p>
                        <Link href={`/roadmap/${roadmap.id}`}>
                          <Button variant="ghost" size="sm">
                            View Roadmap
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Todos */}
          <TodoWidget />
        </div>
      </div>
    </div>
  );
}
