import { getRepository } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";
import { AIModelConfigEntity } from "@/entities/AIModelConfigEntity";
import { AIUsageLogEntity } from "@/entities/AIUsageLogEntity";
import { Activity, Users, Cpu, DollarSign } from "lucide-react";

/**
 * Admin Dashboard
 * Overview of system statistics and recent activity
 */

export default async function AdminDashboard() {
  // Fetch statistics
  const userRepo = await getRepository(UserEntity);
  const modelRepo = await getRepository(AIModelConfigEntity);
  const usageRepo = await getRepository(AIUsageLogEntity);

  const totalUsers = await userRepo.count();
  const activeUsers = await userRepo.count({ where: { status: "active" } });
  const totalModels = await modelRepo.count();
  const enabledModels = await modelRepo.count({ where: { isEnabled: true } });

  // Get recent usage stats (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUsage = await usageRepo
    .createQueryBuilder("log")
    .where("log.createdAt >= :sevenDaysAgo", { sevenDaysAgo })
    .getMany();

  const totalRequests = recentUsage.length;
  const totalCost = recentUsage.reduce(
    (sum, log) => sum + (Number(log.estimatedCost) || 0),
    0
  );
  const totalTokens = recentUsage.reduce(
    (sum, log) => sum + (log.totalTokens || 0),
    0
  );
  // Get recent activity
  const recentActivity = await usageRepo
    .createQueryBuilder("log")
    .orderBy("log.createdAt", "DESC")
    .limit(10)
    .getMany();

  const stats = [
    {
      name: "Total Users",
      value: totalUsers,
      subtext: `${activeUsers} active`,
      icon: Users,
      color: "blue",
    },
    {
      name: "AI Models",
      value: enabledModels,
      subtext: `${totalModels} total`,
      icon: Cpu,
      color: "purple",
    },
    {
      name: "Requests (7d)",
      value: totalRequests.toLocaleString(),
      subtext: `${totalTokens.toLocaleString()} tokens`,
      icon: Activity,
      color: "green",
    },
    {
      name: "Cost (7d)",
      value: `$${totalCost.toFixed(2)}`,
      subtext: "Estimated",
      icon: DollarSign,
      color: "yellow",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Overview of system statistics and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{stat.subtext}</p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    stat.color === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : stat.color === "purple"
                      ? "bg-purple-100 text-purple-600"
                      : stat.color === "green"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent AI Activity
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No AI activity yet
                  </td>
                </tr>
              ) : (
                recentActivity.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.modelId?.split("/")[1] || log.modelId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.requestType || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(log.totalTokens || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${(Number(log.estimatedCost) || 0).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/models"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Manage AI Models</h3>
            <p className="mt-1 text-sm text-gray-600">
              Configure and test AI models
            </p>
          </a>
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="mt-1 text-sm text-gray-600">
              View and manage user accounts
            </p>
          </a>
          <a
            href="/admin/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">View Analytics</h3>
            <p className="mt-1 text-sm text-gray-600">
              Analyze usage and costs
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
