"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";

/**
 * Analytics Page
 * Displays AI usage statistics and cost analytics
 */

interface UsageStats {
  modelId: string;
  provider: string;
  requestCount: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<UsageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("7"); // days

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const url = new URL("/api/admin/usage", window.location.origin);
      url.searchParams.set("aggregate", "true");
      url.searchParams.set("startDate", startDate.toISOString());
      url.searchParams.set("endDate", endDate.toISOString());

      const response = await fetch(url);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch analytics");
      }

      const data = await response.json();
      setStats(data.stats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));

        const url = new URL("/api/admin/usage", window.location.origin);
        url.searchParams.set("aggregate", "true");
        url.searchParams.set("startDate", startDate.toISOString());
        url.searchParams.set("endDate", endDate.toISOString());

        const response = await fetch(url, { signal: abortController.signal });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch analytics");
        }

        const data = await response.json();
        setStats(data.stats);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [dateRange]);

  // Calculate totals
  const totalRequests = stats.reduce((sum, s) => sum + s.requestCount, 0);
  const totalCost = stats.reduce((sum, s) => sum + s.totalCost, 0);
  const totalTokens = stats.reduce((sum, s) => sum + s.totalTokens, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-gray-600">AI usage statistics and cost analysis</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Total Requests</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalRequests.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Across all models
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Total Tokens</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalTokens.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Input + Output
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Total Cost</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${totalCost.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Estimated
          </p>
        </div>
      </div>

      {/* Usage by Model */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Usage by Model
        </h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost/Req
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <p className="text-lg mb-2">No usage data yet</p>
                    <p className="text-sm text-gray-400">
                      Data will appear here once assessments are completed
                    </p>
                  </td>
                </tr>
              ) : (
                stats
                  .sort((a, b) => b.totalCost - a.totalCost)
                  .map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {stat.modelId.split("/")[1] || stat.modelId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stat.modelId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                          {stat.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {stat.requestCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {stat.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {stat.avgLatency.toFixed(0)}ms
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${stat.totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${(stat.totalCost / stat.requestCount).toFixed(4)}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      {stats.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Distribution
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              {stats
                .sort((a, b) => b.totalCost - a.totalCost)
                .map((stat, index) => {
                  const percentage = totalCost > 0 ? (stat.totalCost / totalCost) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {stat.modelId}
                        </span>
                        <span className="text-sm text-gray-600">
                          ${stat.totalCost.toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">About Analytics</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Costs are estimates based on model pricing</li>
          <li>• Latency includes network and processing time</li>
          <li>• Data updates in real-time as assessments are completed</li>
        </ul>
      </div>
    </div>
  );
}
