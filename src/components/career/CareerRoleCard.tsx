import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

interface CareerRoleCardProps {
  role: CareerRole;
}

export default function CareerRoleCard({ role }: CareerRoleCardProps) {
  // Map accessibility level to color
  const accessibilityColor = {
    High: "bg-green-100 text-green-800 border-green-300",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Low: "bg-orange-100 text-orange-800 border-orange-300",
  }[role.accessibilityLevel] || "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${accessibilityColor}`}
          >
            {role.accessibilityLevel}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{role.shortDescription}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 flex-grow">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Timeline</p>
          <p className="text-sm font-semibold text-gray-900">{role.typicalTimeline}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Growth Rate</p>
          <p className="text-sm font-semibold text-gray-900">{role.growthRate}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Salary Range</p>
          <p className="text-sm font-semibold text-gray-900">{role.avgStartingSalary}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Freelance Rate</p>
          <p className="text-sm font-semibold text-gray-900">{role.freelanceRate}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
              {role.category}
            </span>
            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
              Remote: {role.remoteOpportunity}
            </span>
          </div>
        </div>
        <Link href={`/assessment/${role.id}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Start Assessment →
          </Button>
        </Link>
      </div>
    </Card>
  );
}
