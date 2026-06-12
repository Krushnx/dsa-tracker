"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveNotes } from "@/lib/actions/progress.actions";

interface NotesEditorProps {
  problemId: string;
  initialNotes: string;
}

export function NotesEditor({ problemId, initialNotes }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveNotes(problemId, notes);
      if (result.success) {
        toast.success("Notes saved");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[#A1A1AA]">Notes</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-7 px-3 rounded-lg bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Notes"}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add your notes, approach, or solution link here..."
        rows={8}
        className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6]/50 resize-y transition-colors font-mono"
      />
    </div>
  );
}
