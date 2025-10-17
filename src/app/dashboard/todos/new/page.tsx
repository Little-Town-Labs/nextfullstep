"use client";

import { TodoForm } from "@/components/todos/TodoForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTodoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Back Button */}
        <Link
          href="/dashboard/todos"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Todos
        </Link>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Todo</h1>
          <p className="text-gray-600 mt-2">
            Add a new task to track your upskilling progress
          </p>
        </div>

        {/* Form */}
        <TodoForm />
      </div>
    </div>
  );
}
