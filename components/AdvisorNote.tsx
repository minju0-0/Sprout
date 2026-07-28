import { Leaf } from "lucide-react";
import type { AdvisorNote as AdvisorNoteData } from "@/types";
interface AdvisorNoteProps {
  note: AdvisorNoteData;
}
export function AdvisorNote({ note }: AdvisorNoteProps) {
  return (
    <li className="flex items-start gap-2.5 rounded-2xl border border-moss/15 bg-canvas px-4 py-3">
      <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
      <p className="text-sm text-ink">{note.message}</p>
    </li>
  );
}
