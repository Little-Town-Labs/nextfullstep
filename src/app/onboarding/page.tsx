"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [timeCommitment, setTimeCommitment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goals = [
    {
      id: "ai-prompt-engineer",
      title: "AI Prompt Engineer",
      description: "Design and optimize AI prompts for optimal results",
      icon: "💬",
    },
    {
      id: "ai-content-creator",
      title: "AI Content Creator",
      description: "Create engaging content using AI tools",
      icon: "✍️",
    },
    {
      id: "ai-coach",
      title: "AI Coach",
      description: "Help others leverage AI in their work",
      icon: "🎓",
    },
    {
      id: "exploring",
      title: "Just Exploring",
      description: "I'm not sure yet, exploring options",
      icon: "🔍",
    },
  ];

  const experienceLevels = [
    {
      id: "beginner",
      title: "Complete Beginner",
      description: "New to AI and tech",
    },
    {
      id: "some-experience",
      title: "Some Experience",
      description: "Used AI tools occasionally",
    },
    {
      id: "intermediate",
      title: "Intermediate",
      description: "Regular AI tool user",
    },
    {
      id: "advanced",
      title: "Advanced",
      description: "Building with AI regularly",
    },
  ];

  const timeCommitments = [
    {
      id: "casual",
      title: "1-5 hours/week",
      description: "Learning at my own pace",
    },
    {
      id: "parttime",
      title: "5-15 hours/week",
      description: "Actively working toward transition",
    },
    {
      id: "serious",
      title: "15-30 hours/week",
      description: "Serious career change focus",
    },
    {
      id: "fulltime",
      title: "30+ hours/week",
      description: "Full-time commitment",
    },
  ];

  const handleComplete = async () => {
    setIsSubmitting(true);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout

    try {
      // Show loading toast
      const loadingToast = toast.loading("Setting up your account...");

      // Save onboarding data
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedGoal,
          experienceLevel,
          timeCommitment,
        }),
        signal: controller.signal,
      });

      // Clear timeout after fetch completes
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Parse error response for meaningful message
        let errorMessage = "Failed to complete onboarding";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Dismiss loading toast and show error
        toast.dismiss(loadingToast);
        toast.error("Onboarding Failed", {
          description: errorMessage,
          duration: 5000,
        });

        throw new Error(errorMessage);
      }

      // Success - dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Welcome aboard!", {
        description: "Your account is ready. Redirecting to dashboard...",
        duration: 2000,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          toast.error("Request Timeout", {
            description: "The request took too long. Please check your connection and try again.",
            duration: 5000,
          });
        } else if (!error.message.includes("Failed to complete onboarding")) {
          // Only show toast if not already shown above
          toast.error("Something went wrong", {
            description: error.message || "Please try again.",
            duration: 5000,
          });
        }
      }
    } finally {
      // Always clear timeout and reset submitting state
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 3
            </span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "Welcome to NextFullStep!"}
              {step === 2 && "What's your current experience?"}
              {step === 3 && "How much time can you commit?"}
            </CardTitle>
            <CardDescription>
              {step === 1 && `Hi ${user?.firstName || "there"}! Let's personalize your experience.`}
              {step === 2 && "This helps us tailor recommendations to your level"}
              {step === 3 && "We'll create a roadmap that fits your schedule"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Step 1: Career Goal Selection */}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-6 border-2 rounded-lg text-left transition-all hover:border-blue-500 hover:shadow-md ${
                      selectedGoal === goal.id
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="text-3xl mb-3">{goal.icon}</div>
                    <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Experience Level */}
            {step === 2 && (
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-blue-500 ${
                      experienceLevel === level.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{level.title}</h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Time Commitment */}
            {step === 3 && (
              <div className="space-y-3">
                {timeCommitments.map((commitment) => (
                  <button
                    key={commitment.id}
                    onClick={() => setTimeCommitment(commitment.id)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-blue-500 ${
                      timeCommitment === commitment.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{commitment.title}</h3>
                    <p className="text-sm text-gray-600">{commitment.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !selectedGoal) ||
                    (step === 2 && !experienceLevel)
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!timeCommitment || isSubmitting}
                >
                  {isSubmitting ? "Completing..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            disabled={isSubmitting}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
