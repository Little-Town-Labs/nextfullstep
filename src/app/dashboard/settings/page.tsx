import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SettingsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(clerkUserId);

  if (!dbUser) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Account Setup Required</h1>
          <p className="text-gray-600 mb-4">
            Your account hasn&apos;t been initialized in our database yet.
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get subscription details
  const tierInfo = {
    free: {
      name: "Free Plan",
      description: "Basic features to get started",
      features: [
        "1 assessment per month",
        "1 active roadmap",
        "Basic progress tracking",
        "Community support",
      ],
    },
    pro: {
      name: "Pro Plan",
      description: "Advanced features for serious career changers",
      features: [
        "Unlimited assessments",
        "5 active roadmaps",
        "Advanced analytics",
        "Priority support",
        "Roadmap regeneration",
        "AI coaching chat",
      ],
    },
    enterprise: {
      name: "Enterprise Plan",
      description: "Full-featured plan for teams",
      features: [
        "Everything in Pro",
        "Team accounts (up to 10 users)",
        "Custom career paths",
        "Dedicated support",
      ],
    },
  };

  const currentTier = tierInfo[dbUser.subscriptionTier as keyof typeof tierInfo];

  // Calculate usage reset date
  const resetDate = dbUser.usageResetAt
    ? new Date(dbUser.usageResetAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile, subscription, and preferences
          </p>
        </div>

        {/* Subscription & Usage Section */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Usage</CardTitle>
              <CardDescription>Your current plan and usage limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Plan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{currentTier.name}</h3>
                      <p className="text-sm text-gray-600">{currentTier.description}</p>
                    </div>
                    {dbUser.subscriptionTier === "free" && (
                      <Link href="/pricing">
                        <Button>Upgrade to Pro</Button>
                      </Link>
                    )}
                    {dbUser.subscriptionTier !== "free" && (
                      <Link href="/dashboard/subscription/manage">
                        <Button variant="outline">Manage Subscription</Button>
                      </Link>
                    )}
                  </div>

                  {/* Usage Stats */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Assessments</span>
                        <span className="text-sm font-medium">
                          {dbUser.assessmentsUsed} / {dbUser.subscriptionTier === "free" ? dbUser.assessmentsLimit : "∞"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dbUser.assessmentsUsed >= dbUser.assessmentsLimit
                              ? "bg-red-600"
                              : "bg-blue-600"
                          }`}
                          style={{
                            width: `${Math.min(
                              (dbUser.assessmentsUsed / dbUser.assessmentsLimit) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Roadmaps</span>
                        <span className="text-sm font-medium">
                          {dbUser.roadmapsUsed} / {dbUser.roadmapsLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dbUser.roadmapsUsed >= dbUser.roadmapsLimit
                              ? "bg-red-600"
                              : "bg-blue-600"
                          }`}
                          style={{
                            width: `${Math.min(
                              (dbUser.roadmapsUsed / dbUser.roadmapsLimit) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {dbUser.subscriptionTier === "free" && (
                    <p className="text-sm text-gray-500 mt-4">
                      Usage resets on {resetDate}
                    </p>
                  )}
                </div>

                {/* Subscription Status */}
                {dbUser.subscriptionStatus !== "active" && (
                  <div className="border-t pt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Subscription Status:</strong>{" "}
                        {dbUser.subscriptionStatus === "canceled"
                          ? "Canceled - Access until end of billing period"
                          : dbUser.subscriptionStatus === "past_due"
                          ? "Past Due - Please update payment method"
                          : dbUser.subscriptionStatus === "trialing"
                          ? "Trial Period"
                          : dbUser.subscriptionStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clerk User Profile Component */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your email, password, and authentication methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none",
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions - proceed with caution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Delete Account</h4>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  Delete Account
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Note: Account deletion is managed through your profile settings above
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
