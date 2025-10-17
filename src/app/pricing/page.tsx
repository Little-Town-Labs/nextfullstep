import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserByClerkId } from "@/lib/subscription";

export default async function PricingPage() {
  const { userId: clerkUserId } = await auth();
  let currentTier = "free";

  if (clerkUserId) {
    const user = await getUserByClerkId(clerkUserId);
    currentTier = user?.subscriptionTier || "free";
  }

  const pricingPlans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with AI career transitions",
      features: [
        "1 career assessment per month",
        "1 active roadmap",
        "Basic progress tracking",
        "Community support",
        "Email updates",
      ],
      limitations: [
        "Limited to 1 assessment/month",
        "Cannot have multiple roadmaps",
      ],
      cta: "Get Started Free",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      period: "per month",
      yearlyPrice: "$190",
      yearlySavings: "Save $38/year",
      description: "For serious career changers ready to transform",
      features: [
        "Unlimited career assessments",
        "Up to 5 active roadmaps",
        "Advanced analytics dashboard",
        "Priority email support",
        "Roadmap regeneration",
        "AI coaching chat (coming soon)",
        "Weekly progress reports",
        "Custom goal tracking",
      ],
      limitations: [],
      cta: "Upgrade to Pro",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team accounts (up to 10 users)",
        "Custom career paths",
        "Dedicated account manager",
        "Priority support (24/7)",
        "White-label options",
        "API access",
        "Advanced reporting",
        "Custom integrations",
      ],
      limitations: [],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-16 px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your career transformation journey
          </p>
          {currentTier !== "free" && (
            <p className="mt-4 text-sm text-blue-600 font-medium">
              Currently on {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-blue-600 border-2 shadow-xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  {plan.yearlyPrice && (
                    <div className="mt-2">
                      <span className="text-lg text-gray-600">
                        or {plan.yearlyPrice}/year
                      </span>
                      <span className="ml-2 text-sm text-green-600 font-semibold">
                        {plan.yearlySavings}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-gray-700 uppercase">
                      Includes
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="font-semibold mb-2 text-sm text-gray-700 uppercase">
                        Limitations
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span className="text-sm text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-6">
{currentTier === plan.id ? (
  <Button variant="outline" className="w-full" disabled>
    Current Plan
  </Button>
) : plan.id === "enterprise" ? (
  <Link href="/contact-sales">
    <Button variant={plan.ctaVariant} className="w-full">
      {plan.cta}
    </Button>
  </Link>
) : clerkUserId ? (
  <Link href={plan.id === "free" ? "#" : `/checkout/${plan.id}`}>
    <Button
      variant={plan.ctaVariant}
      className="w-full"
      disabled={plan.id === "free"}
    >
      {plan.cta}
    </Button>
  </Link>
) : (
  <Link href="/sign-up">
    <Button variant={plan.ctaVariant} className="w-full">
      {plan.cta}
    </Button>
  </Link>
)}                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I change plans at any time?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. When upgrading,
                  you&apos;ll get immediate access to new features. When downgrading, changes
                  take effect at the end of your current billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens to my data if I downgrade?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your data is never deleted. If you downgrade to Free and exceed the
                  limits (e.g., more than 1 roadmap), you&apos;ll retain view-only access to
                  your existing roadmaps but won&apos;t be able to create new ones until you
                  upgrade or stay within limits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Do you offer refunds?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 14-day money-back guarantee on all paid plans. If you&apos;re not
                  satisfied for any reason, contact us within 14 days of your purchase for
                  a full refund.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Is the Pro plan worth it?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  If you&apos;re serious about your career transition and want to explore
                  multiple AI career paths, Pro is definitely worth it. You&apos;ll get
                  unlimited assessments, can maintain up to 5 roadmaps simultaneously, and
                  access advanced features like roadmap regeneration and AI coaching.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Career?
              </h2>
              <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                Join thousands of professionals successfully transitioning into AI careers
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href={clerkUserId ? "/dashboard" : "/sign-up"}>
                  <Button size="lg" variant="secondary">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/careers">
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
                    Browse Careers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
