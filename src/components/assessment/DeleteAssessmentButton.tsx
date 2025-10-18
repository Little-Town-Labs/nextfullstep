"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DeleteAssessmentButtonProps {
  assessmentId: string;
  assessmentName: string;
}

export function DeleteAssessmentButton({
  assessmentId,
  assessmentName,
}: DeleteAssessmentButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete the "${assessmentName}" assessment?\n\nThis will also delete the related roadmap and all tasks. This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/delete`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the page to show updated list
        router.refresh();
      } else {
        alert(`Failed to delete assessment: ${data.error || data.message}`);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert("An error occurred while deleting the assessment. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
