import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserByClerkId } from "@/lib/subscription";
import { getRepository } from "@/lib/data-source";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  BarChart3
} from "lucide-react";

export default async function RoadmapsPage() {
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

  // Fetch all roadmaps
  const roadmapRepo = await getRepository(RoadmapEntity);
  const allRoadmaps = (await roadmapRepo.find({
    where: { userId: clerkUserId },
    order: { createdAt: "DESC" }
  })) as RoadmapEntity[];

  // Categorize roadmaps
  const activeRoadmaps = allRoadmaps.filter(r =>
    r.status === "active" && r.progressPercentage < 100
  );
  const completedRoadmaps = allRoadmaps.filter(r =>
    r.progressPercentage === 100
  );
  const pausedRoadmaps = allRoadmaps.filter(r =>
    r.status === "paused"
  );

  // Calculate overall statistics
  const totalTasks = allRoadmaps.reduce((sum, r) => sum + (r.totalTasks || 0), 0);
  const completedTasks = allRoadmaps.reduce((sum, r) => sum + (r.completedTasks || 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const longestStreak = Math.max(...allRoadmaps.map(r => r.longestStreak || 0), 0);

  type RoadmapCardProps = {
    roadmap: RoadmapEntity;
  };

  const getStatusBadge = (roadmap: RoadmapEntity) => {
    if (roadmap.progressPercentage === 100) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    if (roadmap.status === "paused") {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Paused</Badge>;
    }
    return <Badge className="bg-blue-500">Active</Badge>;
  };

  const RoadmapCard = ({ roadmap }: RoadmapCardProps) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{roadmap.roleName}</CardTitle>
            <CardDescription>
              Started {new Date(roadmap.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          {getStatusBadge(roadmap)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-2xl font-bold text-blue-600">
                {roadmap.progressPercentage}%
              </span>
            </div>
            <Progress value={roadmap.progressPercentage} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">
              {roadmap.completedTasks} of {roadmap.totalTasks} tasks completed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-lg font-bold">{roadmap.currentStreak}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold">{roadmap.daysActive}</div>
              <div className="text-xs text-gray-600">Days Active</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-lg font-bold">{roadmap.longestStreak}</div>
              <div className="text-xs text-gray-600">Best Streak</div>
            </div>
          </div>

          {/* Last Activity */}
          {roadmap.lastActivityDate && (
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-600">
                Last activity: {new Date(roadmap.lastActivityDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link href={`/roadmap/${roadmap.id}`} className="flex-1">
              <Button className="w-full" variant="default">
                View Roadmap
              </Button>
            </Link>
            <Link href={`/assessment/${roadmap.assessmentId}/results`}>
              <Button variant="outline" size="icon">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Map className="h-8 w-8 text-blue-600" />
                My Roadmaps
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage your career transformation roadmaps
              </p>
            </div>
            <Link href="/careers">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Statistics */}
        {allRoadmaps.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Overall Progress</CardDescription>
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{overallProgress}%</div>
                <Progress value={overallProgress} className="mb-2" />
                <p className="text-sm text-gray-600">
                  {completedTasks} / {totalTasks} tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Roadmaps</CardDescription>
                  <Map className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{allRoadmaps.length}</div>
                <p className="text-sm text-gray-600">
                  {activeRoadmaps.length} active, {completedRoadmaps.length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Best Streak</CardDescription>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{longestStreak}</div>
                <p className="text-sm text-gray-600">days of consistent work</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Completed</CardDescription>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{completedRoadmaps.length}</div>
                <p className="text-sm text-gray-600">roadmaps finished</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Roadmaps State */}
        {allRoadmaps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Roadmaps Yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Take a career assessment to get your personalized AI-powered roadmap
                and start your transformation journey.
              </p>
              <Link href="/careers">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Take Your First Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Roadmaps */}
            {activeRoadmaps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Active Roadmaps ({activeRoadmaps.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeRoadmaps.map((roadmap) => (
                    <RoadmapCard key={roadmap.id} roadmap={roadmap} />
                  ))}
                </div>
              </div>
            )}

            {/* Paused Roadmaps */}
            {pausedRoadmaps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  Paused Roadmaps ({pausedRoadmaps.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pausedRoadmaps.map((roadmap) => (
                    <RoadmapCard key={roadmap.id} roadmap={roadmap} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Roadmaps */}
            {completedRoadmaps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Completed Roadmaps ({completedRoadmaps.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedRoadmaps.map((roadmap) => (
                    <RoadmapCard key={roadmap.id} roadmap={roadmap} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
