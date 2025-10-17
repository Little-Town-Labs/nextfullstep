"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [roadmapId, setRoadmapId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/assessment?id=${assessmentId}`);
        const data = await res.json();

        if (data.success) {
          setAssessment(data.assessment);

          // Fetch roadmap for this assessment
          const roadmapRes = await fetch(
            `/api/roadmap?assessmentId=${assessmentId}`
          );
          const roadmapData = await roadmapRes.json();

          if (roadmapData.success && roadmapData.roadmap) {
            setRoadmapId(roadmapData.roadmap.id);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching results:", error);
        setLoading(false);
      }
    }

    fetchResults();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Results Not Found
          </h2>
          <Button onClick={() => router.push("/careers")}>
            Back to Careers
          </Button>
        </Card>
      </div>
    );
  }

  // Map verdict tier to visual styling
  const verdictConfig = {
    QUALIFIED_NOW: {
      icon: "✅",
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      label: "Qualified Now",
    },
    NEARLY_QUALIFIED: {
      icon: "⚡",
      color: "yellow",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      label: "Nearly Qualified",
    },
    SIGNIFICANT_GAPS: {
      icon: "📚",
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      label: "Significant Gaps",
    },
    NOT_VIABLE: {
      icon: "🔄",
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      label: "Not Currently Viable",
    },
    UNKNOWN: {
      icon: "❓",
      color: "gray",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-800",
      label: "Analysis Complete",
    },
  };

  const verdict =
    verdictConfig[assessment.verdict?.tier as keyof typeof verdictConfig] ||
    verdictConfig.UNKNOWN;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Assessment Results
          </h1>
          <p className="text-lg text-gray-600">{assessment.roleName}</p>
        </div>

        {/* Verdict Card */}
        <Card
          className={`p-8 mb-8 border-2 ${verdict.borderColor} ${verdict.bgColor}`}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{verdict.icon}</div>
            <h2 className={`text-3xl font-bold mb-2 ${verdict.textColor}`}>
              {verdict.label}
            </h2>
            {assessment.verdict && (
              <div className="flex items-center justify-center gap-6 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Match Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assessment.verdict.score}%
                  </p>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assessment.verdict.timeline}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Full Analysis */}
        <Card className="p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Detailed Analysis & Roadmap
          </h3>
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {assessment.fullAnalysis}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {roadmapId && (
            <Button
              size="lg"
              onClick={() => router.push(`/roadmap/${roadmapId}`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              View Your Roadmap →
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/careers")}>
            Explore Other Roles
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            View Dashboard
          </Button>
        </div>

        {/* Assessment Metadata */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Assessment completed on{" "}
            {new Date(assessment.completedAt).toLocaleDateString()}
          </p>
          <p className="mt-1">Assessment ID: {assessment.id}</p>
        </div>
      </div>
    </div>
  );
}
