import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getRepository } from "@/lib/data-source";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AssessmentsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Fetch all user's assessments
  const assessmentRepo = await getRepository(CareerAssessmentEntity);
  const assessments = await assessmentRepo.find({
    where: { userId: clerkUserId },
    order: { startedAt: "DESC" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
          <p className="text-gray-600 mt-2">
            View all your career assessments and their results
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Link href="/careers">
            <Button>Take New Assessment</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Assessments List */}
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Assessments Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Take your first career assessment to get personalized guidance and a roadmap
              </p>
              <Link href="/careers">
                <Button>Browse Career Paths</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{assessment.roleName}</CardTitle>
                  <CardDescription>
                    Started: {new Date(assessment.startedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Status Badge */}
                  <div className="mb-4">
                    {assessment.status === "completed" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        ⏳ In Progress
                      </span>
                    )}
                  </div>

                  {/* Results Summary (if completed) */}
                  {assessment.status === "completed" && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Match Score</span>
                        <span className="text-lg font-bold text-blue-600">
                          {assessment.verdictScore}%
                        </span>
                      </div>
                      {assessment.verdictTier && (
                        <div className="text-sm">
                          <span className="font-medium">
                            {assessment.verdictTier === "QUALIFIED_NOW" && "✅ Qualified Now"}
                            {assessment.verdictTier === "NEARLY_QUALIFIED" && "⚡ Nearly Qualified"}
                            {assessment.verdictTier === "SIGNIFICANT_GAPS" && "📚 Significant Gaps"}
                            {assessment.verdictTier === "NOT_VIABLE" && "🔄 Not Viable"}
                          </span>
                        </div>
                      )}
                      {assessment.verdictTimeline && (
                        <div className="text-xs text-gray-500 mt-1">
                          Timeline: {assessment.verdictTimeline}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress (if in progress) */}
                  {assessment.status === "in_progress" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{assessment.currentQuestionNumber || 0} / 8 questions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${((assessment.currentQuestionNumber || 0) / 8) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {assessment.status === "completed" ? (
                      <Link
                        href={`/assessment/${assessment.id}/results`}
                        className="flex-1"
                      >
                        <Button className="w-full" variant="default">
                          View Results
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={`/assessment/start/${assessment.roleId}`}
                        className="flex-1"
                      >
                        <Button className="w-full" variant="default">
                          Continue
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Completed Date */}
                  {assessment.completedAt && (
                    <div className="text-xs text-gray-500 mt-3">
                      Completed: {new Date(assessment.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
