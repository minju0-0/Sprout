"use client";
import type { Goal } from "@/types";
import { GoalTree } from "@/components/GoalTree";

interface GoalTreePreviewProps {
  goal: Goal;
}

export function GoalTreePreview({ goal }: GoalTreePreviewProps) {
  return (
    <div className="flex h-40 items-start justify-center overflow-hidden">
      <GoalTree goal={goal} currencyCode={null} onContribute={() => {}} onEdit={() => {}} />
    </div>
  );
}