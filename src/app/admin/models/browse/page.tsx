"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  RefreshCw,
  Filter,
  Search,
  DollarSign,
  Zap,
  ArrowLeft,
  Plus,
} from "lucide-react";
import Link from "next/link";

/**
 * Browse and Select AI Models from OpenRouter
 * Allows admins to browse all available OpenRouter models and select which ones to add
 */

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
    request: number;
    image: number;
  };
  context_length: number;
  architecture: any;
  top_provider: any;
  per_request_limits: any;
}

export default function BrowseModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "cost" | "context">("name");

  // Fetch models from OpenRouter
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/models/browse");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch models");
      }

      setModels(data.models);
      setFilteredModels(data.models);
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

  // Filter and sort models
  useEffect(() => {
    let filtered = [...models];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Provider filter
    if (selectedProvider !== "all") {
      filtered = filtered.filter((model) =>
        model.id.startsWith(selectedProvider + "/")
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "cost":
          return a.pricing.prompt - b.pricing.prompt;
        case "context":
          return b.context_length - a.context_length;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredModels(filtered);
  }, [models, searchTerm, selectedProvider, sortBy]);

  // Get unique providers
  const providers = Array.from(
    new Set(models.map((model) => model.id.split("/")[0]))
  ).sort();

  // Toggle model selection
  const toggleModel = (modelId: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(modelId)) {
      newSelected.delete(modelId);
    } else {
      newSelected.add(modelId);
    }
    setSelectedModels(newSelected);
  };

  // Add selected models
  const addSelectedModels = async () => {
    if (selectedModels.size === 0) {
      alert("Please select at least one model");
      return;
    }

    if (
      !confirm(
        `Add ${selectedModels.size} selected model(s) to your database?`
      )
    ) {
      return;
    }

    try {
      setAdding(true);

      const selectedModelData = models.filter((model) =>
        selectedModels.has(model.id)
      );

      const response = await fetch("/api/admin/models/add-selected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models: selectedModelData }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        const errorMessage = data.message || data.error || "Failed to add models";
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      alert(
        `Success! Added ${data.summary.created} model(s), skipped ${data.summary.skipped} existing model(s).`
      );
      router.push("/admin/models");
    } catch (err: any) {
      console.error("Error adding models:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  // Format cost for display
  const formatCost = (costPerToken: number) => {
    const costPer1kTokens = costPerToken * 1000;
    return `$${costPer1kTokens.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Loading models from OpenRouter...</p>
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
      <div>
        <Link href="/admin/models">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Models
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Browse OpenRouter Models
        </h1>
        <p className="mt-1 text-gray-600">
          Select models to add to your database ({models.length} available)
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Provider Filter */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Providers</option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "cost" | "context")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="cost">Sort by Cost</option>
            <option value="context">Sort by Context</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={addSelectedModels}
            disabled={selectedModels.size === 0 || adding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {adding
              ? "Adding..."
              : `Add Selected (${selectedModels.size})`}
          </button>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No models found matching your filters
          </div>
        ) : (
          filteredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => toggleModel(model.id)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedModels.has(model.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {/* Selection Indicator */}
              <div className="absolute top-3 right-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    selectedModels.has(model.id)
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  {selectedModels.has(model.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Model Info */}
              <div className="pr-8">
                <h3 className="font-semibold text-gray-900">{model.name}</h3>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {model.id}
                </p>

                {model.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {model.description}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <DollarSign className="w-3 h-3" />
                    <span>
                      In: {formatCost(model.pricing.prompt)}/1k · Out:{" "}
                      {formatCost(model.pricing.completion)}/1k
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Zap className="w-3 h-3" />
                    <span>
                      {model.context_length.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                {/* Provider Badge */}
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize">
                    {model.id.split("/")[0]}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredModels.length} of {models.length} models
          </span>
          <span>{selectedModels.size} selected</span>
        </div>
      </div>
    </div>
  );
}
