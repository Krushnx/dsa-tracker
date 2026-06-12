"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { createGoalAction, updateGoalAction, deleteGoalAction } from "@/lib/actions/goals.actions";
import type { GoalItem } from "@/lib/services/goals.service";

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
  COMPLETED: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20",
  ARCHIVED: "text-[#71717A] bg-[#71717A]/10 border-[#71717A]/20",
};

export function GoalsClient({ initial }: { initial: GoalItem[] }) {
  const [goals, setGoals] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GoalItem | null>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("300");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data.goals);
  };

  const openCreate = () => { setEditing(null); setTitle(""); setTarget("300"); setOpen(true); };
  const openEdit = (g: GoalItem) => { setEditing(g); setTitle(g.title); setTarget(String(g.targetProblems)); setOpen(true); };

  const handleSave = async () => {
    if (!title.trim() || !target) return;
    setLoading(true);
    try {
      const r = editing
        ? await updateGoalAction(editing._id, { title, targetProblems: parseInt(target) })
        : await createGoalAction({ title, targetProblems: parseInt(target) });
      if (r.success) { toast.success(r.message); setOpen(false); await refresh(); }
      else toast.error(r.message);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    const r = await deleteGoalAction(id);
    if (r.success) { toast.success(r.message); await refresh(); }
    else toast.error(r.message);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={<Target className="w-5 h-5" />} title="No goals yet" description="Set a problem-solving target to stay motivated." actionLabel="Create Goal" onAction={openCreate} className="bg-[#111111] border border-[#262626] rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <div key={g._id} className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#FAFAFA]">{g.title}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs border ${STATUS_COLOR[g.status]}`}>{g.status}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-[#262626] hover:text-[#FAFAFA] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(g._id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-[#3B82F6]">{g.percentage}%</span>
                <span className="text-xs text-[#71717A]">{g.currentProgress} / {g.targetProblems}</span>
              </div>
              <Progress value={g.percentage} className="h-1.5 bg-[#262626]" />
              <p className="text-xs text-[#71717A] mt-2">{g.targetProblems - g.currentProgress} problems remaining</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#111111] border-[#262626] text-[#FAFAFA] max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs text-[#71717A] mb-1 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Solve 300 problems" className="w-full h-9 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] outline-none focus:border-[#3B82F6]/50" />
            </div>
            <div>
              <label className="text-xs text-[#71717A] mb-1 block">Target Problems</label>
              <div className="flex gap-2">
                {["100","300","500"].map(n => (
                  <button key={n} onClick={() => setTarget(n)} className={`flex-1 h-9 rounded-xl text-sm border transition-colors ${target === n ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]" : "border-[#262626] text-[#71717A] hover:text-[#FAFAFA]"}`}>{n}</button>
                ))}
              </div>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="w-full h-9 px-3 mt-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] outline-none focus:border-[#3B82F6]/50" />
            </div>
            <button onClick={handleSave} disabled={loading} className="w-full h-9 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : "Save Goal"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
