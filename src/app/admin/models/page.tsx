"use client";

import { useState, useEffect } from "react";
import { Check, X, Settings, Trash2, RefreshCw, Plus, Search } from "lucide-react";
import Link from "next/link";

/**
 * AI Models Management Page
 * Allows admins to manage AI model configurations
 */

interface AIModel {
  id: string;
  modelId: string;
  provider: string;
  displayName: string;
  description?: string;
  isEnabled: boolean;
  isDefault: boolean;
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  maxTokens?: number;
  temperature: number;
  maxOutputTokens: number;
  usageCount: number;
  lastUsedAt?: string;
  status: string;
}

export default function AIModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Fetch models
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/models");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch models");
      }

      setModels(data.models);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Toggle model enabled/disabled
  const toggleEnabled = async (modelId: string) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle model");
      }

      await fetchModels();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Set default model
  const setDefault = async (modelId: string) => {
    try {
      const response = await fetch("/api/admin/models/default", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId }),
      });

      if (!response.ok) {
        throw new Error("Failed to set default model");
      }

      await fetchModels();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Delete model
  const deleteModel = async (modelId: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete "${displayName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete model");
      }

      await fetchModels();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Seed models
  const seedModels = async () => {
    if (!confirm("This will populate the database with predefined AI models from OpenRouter. Continue?")) {
      return;
    }

    try {
      setSeeding(true);
      const response = await fetch("/api/admin/models/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed models");
      }

      alert(`Success! Created ${data.summary.created} models, skipped ${data.summary.skipped} existing models.`);
      await fetchModels();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Loading models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchModels}
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
          <h1 className="text-2xl font-bold text-gray-900">AI Models</h1>
          <p className="mt-1 text-gray-600">
            Manage AI model configurations and settings
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/models/browse">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Models
            </button>
          </Link>
          <button
            onClick={seedModels}
            disabled={seeding}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {seeding ? "Seeding..." : "Quick Seed"}
          </button>
          <button
            onClick={fetchModels}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Models Table */}
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
                Cost (per 1k tokens)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Default
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Enabled
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <p className="text-lg mb-2">No AI models configured</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Browse and select models from OpenRouter or use Quick Seed for defaults
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Link href="/admin/models/browse">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Browse All Models
                      </button>
                    </Link>
                    <button
                      onClick={seedModels}
                      disabled={seeding}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {seeding ? "Seeding..." : "Quick Seed (7 Models)"}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              models.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {model.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {model.modelId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                      {model.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {model.costPer1kInputTokens !== undefined ? (
                      <div>
                        <div>In: ${model.costPer1kInputTokens.toFixed(2)}</div>
                        <div>Out: ${model.costPer1kOutputTokens?.toFixed(2)}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {model.usageCount.toLocaleString()} requests
                  </td>
                  <td className="px-6 py-4">
                    {model.isDefault ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        <Check className="w-3 h-3 mr-1" />
                        Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefault(model.id)}
                        className="text-sm text-gray-600 hover:text-blue-600"
                        disabled={!model.isEnabled}
                      >
                        Set as default
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleEnabled(model.id)}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        model.isEnabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {model.isEnabled ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Enabled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          deleteModel(model.id, model.displayName)
                        }
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete model"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <strong>Browse Models:</strong> Search and select from 100+ OpenRouter models
          </li>
          <li>
            <strong>Quick Seed:</strong> Instantly add 7 popular models (GPT-4, Claude, Gemini, etc.)
          </li>
          <li>
            <strong>Manage:</strong> Enable/disable models and set a default for assessments
          </li>
          <li>
            <strong>Track:</strong> Monitor usage and costs automatically
          </li>
        </ul>
      </div>
    </div>
  );
}
