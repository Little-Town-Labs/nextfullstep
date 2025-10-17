"use client";

import { useEffect, useState } from "react";
import CareerRoleCard from "@/components/career/CareerRoleCard";

interface CareerRole {
  id: string;
  name: string;
  shortDescription: string;
  category: string;
  accessibilityLevel: string;
  typicalTimeline: string;
  avgStartingSalary: string;
  freelanceRate: string;
  growthRate: string;
  remoteOpportunity: string;
}

export default function CareersPage() {
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch("/api/careers");
        const data = await response.json();

        if (data.success) {
          setRoles(data.roles);
        } else {
          setError(data.error || "Failed to load career roles");
        }
      } catch (err: any) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading career paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Career Paths
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            AI-Powered Career Guidance
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transition to an AI Career
            <span className="block text-blue-600 mt-2">Get Your Personal Roadmap</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get an honest assessment of your qualifications and a step-by-step roadmap
            to break into the AI economy—in just 10 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Brutally Honest Verdict</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Trackable Roadmap</span>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">8</div>
              <p className="text-sm text-blue-100">Targeted Questions</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10 min</div>
              <p className="text-sm text-blue-100">Quick Assessment</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4</div>
              <p className="text-sm text-blue-100">Qualification Tiers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-sm text-blue-100">Free & Personalized</p>
            </div>
          </div>
        </div>

        {/* Career Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <CareerRoleCard key={role.id} role={role} />
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              How It Works
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From assessment to action in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Choose Your Path</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Select from 3 high-demand AI careers based on your interests and current skills
                </p>
                <div className="text-blue-600 text-xs font-medium">
                  AI Prompt Engineer • AI Content Creator • AI Coach
                </div>
              </div>
              {/* Arrow for desktop */}
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Take Assessment</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Answer 8 targeted questions about your background, skills, and learning ability
                </p>
                <div className="text-purple-600 text-xs font-medium">
                  ⏱️ 5-10 minutes • Resume anytime
                </div>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-purple-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Get Your Verdict</h4>
                <p className="text-gray-600 text-sm mb-3">
                  AI analyzes your responses and delivers an honest qualification verdict with timeline
                </p>
                <div className="text-indigo-600 text-xs font-medium">
                  ✅ Qualified • ⚡ Nearly Qualified • 📚 Gaps • 🔄 Pivot
                </div>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-indigo-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  4
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Follow Your Roadmap</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Track progress with phase-based roadmap and check off tasks as you complete them
                </p>
                <div className="text-green-600 text-xs font-medium">
                  📍 30-day • 3-6 month • 6-12 month milestones
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-10">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              What You&apos;ll Get
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to transition into your AI career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-4xl">🎯</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Honest Assessment</h4>
              <p className="text-sm text-gray-600">
                No BS. Get a realistic evaluation of where you stand and what it will take to succeed
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-4xl">🗺️</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Personalized Roadmap</h4>
              <p className="text-sm text-gray-600">
                Phase-based action plan with specific tasks, timelines, and resources tailored to you
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-4xl">📊</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Progress Tracking</h4>
              <p className="text-sm text-gray-600">
                Check off tasks, track streaks, and monitor your progress with visual dashboards
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your AI Career?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose a role below and take your first step toward the AI economy today—completely free
          </p>
        </div>
      </div>
    </div>
  );
}
