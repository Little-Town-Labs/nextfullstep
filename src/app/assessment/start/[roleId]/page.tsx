"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getQuestionsForRole } from "@/lib/assessment-questions";

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.roleId as string;
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [responses, setResponses] = useState<
    Array<{ questionNumber: number; question: string; answer: string }>
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const questions = getQuestionsForRole(roleId);

  useEffect(() => {
    async function initAssessment() {
      // Wait for Clerk to load
      if (!isLoaded) return;

      // Require authentication
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        // Fetch role details
        const roleRes = await fetch(`/api/careers?id=${roleId}`);
        const roleData = await roleRes.json();

        if (roleData.success) {
          setRoleName(roleData.role.name);
        }

        // Start or resume assessment
        const assessmentRes = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleId }),
        });

        const assessmentData = await assessmentRes.json();

        if (!assessmentRes.ok) {
          // Handle API errors
          setError(
            assessmentData.message ||
            assessmentData.error ||
            "Failed to start assessment"
          );
          setLoading(false);
          return;
        }

        if (assessmentData.success) {
          setAssessmentId(assessmentData.assessment.id);

          // Safety check: ensure currentQuestionNumber is within valid range
          let questionIndex = assessmentData.assessment.currentQuestionNumber || 0;
          if (questionIndex >= questions.length) {
            questionIndex = questions.length - 1; // Reset to last question
          }
          if (questionIndex < 0) {
            questionIndex = 0;
          }
          setCurrentQuestion(questionIndex);

          // Restore previous responses
          if (assessmentData.assessment.responses?.length > 0) {
            setResponses(assessmentData.assessment.responses);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error initializing assessment:", error);
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    }

    initAssessment();
  }, [roleId, isLoaded, user, router]);

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      alert("Please provide an answer before continuing");
      return;
    }

    const question = questions[currentQuestion];

    // Save answer to API
    try {
      await fetch(`/api/assessment/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionNumber: question.number,
          question: question.question,
          answer: currentAnswer,
        }),
      });

      // Update local responses
      const newResponses = [
        ...responses.filter(
          (r) => r.questionNumber !== question.number
        ),
        {
          questionNumber: question.number,
          question: question.question,
          answer: currentAnswer,
        },
      ];
      setResponses(newResponses);

      // Move to next question or complete
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentAnswer("");

        // Pre-fill if answer exists
        const existingAnswer = newResponses.find(
          (r) => r.questionNumber === questions[currentQuestion + 1].number
        );
        if (existingAnswer) {
          setCurrentAnswer(existingAnswer.answer);
        }
      } else {
        // All questions answered, complete assessment
        await completeAssessment();
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      alert("Failed to save answer. Please try again.");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);

      // Load previous answer
      const prevAnswer = responses.find(
        (r) => r.questionNumber === questions[currentQuestion - 1].number
      );
      setCurrentAnswer(prevAnswer?.answer || "");
    }
  };

  const completeAssessment = async () => {
    setIsAnalyzing(true);

    try {
      const res = await fetch(`/api/assessment/${assessmentId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to results page
        router.push(`/assessment/${assessmentId}/results`);
      } else {
        alert("Failed to complete assessment: " + data.error);
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Error completing assessment:", error);
      alert("Failed to complete assessment. Please try again.");
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Unable to Start Assessment
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/careers")}>
              Back to Careers
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Card className="p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Analyzing Your Responses...
          </h2>
          <p className="text-gray-600 mb-2">
            Our AI career advisor is evaluating your qualifications for the{" "}
            <span className="font-semibold">{roleName}</span> role.
          </p>
          <p className="text-sm text-gray-500">
            This usually takes 10-30 seconds
          </p>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Assessment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            No questions found for this career role.
          </p>
          <Button onClick={() => router.push("/careers")}>
            Back to Careers
          </Button>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {roleName} Assessment
          </h1>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-right">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-blue-600 mb-2">
              {question.title}
            </h2>
            <p className="text-lg text-gray-900 leading-relaxed">
              {question.question}
            </p>
          </div>

          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            autoFocus
          />

          <p className="text-sm text-gray-500 mt-2">
            Be honest and specific - this helps us give you accurate guidance
          </p>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </Button>

          <Button onClick={handleNext} disabled={!currentAnswer.trim()}>
            {currentQuestion === questions.length - 1
              ? "Complete Assessment"
              : "Next Question →"}
          </Button>
        </div>

        {/* Response Summary */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {responses.length} of {questions.length} questions answered
          </p>
        </div>
      </div>
    </div>
  );
}
