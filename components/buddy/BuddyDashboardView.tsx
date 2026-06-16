"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Flame, UserX, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuddyDashboard } from "@/lib/services/buddy.service";

interface Props {
  dashboard: BuddyDashboard;
  onRemoveBuddy: () => void;
  removing: boolean;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function BuddyDashboardView({ dashboard, onRemoveBuddy, removing }: Props) {
  const { me, buddy, todayWinner, buddyOfMonth, calendar } = dashboard;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Monthly scoreboard */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-medium text-[#FAFAFA]">
              {MONTH_NAMES[new Date().getMonth()]} Leaderboard
            </h3>
          </div>
          <button
            onClick={onRemoveBuddy}
            disabled={removing}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[#EF4444] text-xs hover:bg-[#EF4444]/10 border border-[#EF4444]/20 transition-colors disabled:opacity-50"
          >
            <UserX className="w-3.5 h-3.5" />
            Remove Buddy
          </button>
        </div>

        {/* Buddy of month banner */}
        {buddyOfMonth !== "none" && (
          <div className={cn(
            "mb-6 p-3 rounded-xl text-xs font-medium text-center border",
            buddyOfMonth === "tie"
              ? "bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]"
              : buddyOfMonth === "me"
              ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
              : "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]"
          )}>
            🏆 Buddy of the Month:{" "}
            {buddyOfMonth === "tie" ? "It's a tie!" : buddyOfMonth === "me" ? `${me.name} (You)` : buddy.name}
          </div>
        )}

        {/* VS card */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Me */}
          <PlayerCard
            user={me}
            isWinner={buddyOfMonth === "me"}
            label="You"
            scoreLabel="Monthly Wins"
          />

          {/* Center */}
          <div className="text-center">
            <p className="text-xs text-[#71717A] mb-1">vs</p>
            <div className="text-lg font-bold text-[#FAFAFA]">
              {me.monthlyWins} — {buddy.monthlyWins}
            </div>
            <p className="text-[10px] text-[#71717A]">wins this month</p>
          </div>

          {/* Buddy */}
          <PlayerCard
            user={buddy}
            isWinner={buddyOfMonth === "buddy"}
            label="Buddy"
            scoreLabel="Monthly Wins"
            flip
          />
        </div>
      </div>

      {/* Today's battle */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Flame className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-sm font-medium text-[#FAFAFA]">Today&apos;s Battle</h3>
          {todayWinner !== "none" && (
            <span className={cn(
              "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
              todayWinner === "tie" ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                : todayWinner === "me" ? "bg-[#22C55E]/10 text-[#22C55E]"
                : "bg-[#F59E0B]/10 text-[#F59E0B]"
            )}>
              {todayWinner === "tie" ? "Tie!" : todayWinner === "me" ? "You're winning 🎉" : `${buddy.name} winning`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <TodayCard user={me} isWinner={todayWinner === "me"} isTie={todayWinner === "tie"} label="You" />
          <div className="text-center">
            <p className="text-xl font-bold text-[#FAFAFA]">{me.todayPoints}</p>
            <p className="text-xs text-[#71717A]">vs</p>
            <p className="text-xl font-bold text-[#FAFAFA]">{buddy.todayPoints}</p>
            <p className="text-[10px] text-[#71717A] mt-1">pts</p>
          </div>
          <TodayCard user={buddy} isWinner={todayWinner === "buddy"} isTie={todayWinner === "tie"} label="Buddy" flip />
        </div>

        {/* Points legend */}
        <div className="flex gap-4 justify-center mt-4 pt-4 border-t border-[#262626]">
          {[["Easy", "2pts", "#22C55E"], ["Medium", "4pts", "#F59E0B"], ["Hard", "8pts", "#EF4444"]].map(([d, p, c]) => (
            <div key={d} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-xs text-[#71717A]">{d}</span>
              <span className="text-xs font-medium" style={{ color: c }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
        <h3 className="text-sm font-medium text-[#FAFAFA] mb-4">30-Day Battle History</h3>
        <div className="flex items-center gap-3 text-xs text-[#71717A] mb-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#22C55E]" /> You won</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> Buddy won</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#3B82F6]" /> Tie</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#262626]" /> No contest</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-1.5">
          {calendar.map((day) => {
            const isToday = day.date === today;
            const bg =
              day.winner === "me" ? "#22C55E"
              : day.winner === "buddy" ? "#F59E0B"
              : day.winner === "tie" ? "#3B82F6"
              : "#1a1a1a";

            const d = new Date(day.date + "T00:00:00");
            const dayNum = d.getDate();
            const monthStr = MONTH_NAMES[d.getMonth()];
            const label = `${dayNum} ${monthStr}`;
            const hasActivity = day.winner !== "none";

            return (
              <div
                key={day.date}
                title={`${label}: You ${day.mePoints}pts, Buddy ${day.buddyPoints}pts${hasActivity ? ` — ${day.winner === "me" ? "You won" : day.winner === "buddy" ? "Buddy won" : "Tie"}` : ""}`}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg cursor-default transition-transform hover:scale-105 select-none",
                  "h-12 w-full border",
                  isToday ? "ring-2 ring-white/40" : "",
                  hasActivity ? "border-transparent" : "border-[#262626]"
                )}
                style={{ backgroundColor: hasActivity ? bg : "#171717" }}
              >
                <span className={cn(
                  "text-[11px] font-bold leading-none",
                  hasActivity ? "text-white" : "text-[#71717A]"
                )}>
                  {dayNum}
                </span>
                <span className={cn(
                  "text-[9px] leading-none mt-0.5",
                  hasActivity ? "text-white/70" : "text-[#3B3B3B]"
                )}>
                  {monthStr}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#71717A]">
          <span>{calendar[0]?.date ? new Date(calendar[0].date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PlayerCardProps {
  user: { name: string; email: string; image: string; monthlyWins: number };
  isWinner: boolean;
  label: string;
  scoreLabel: string;
  flip?: boolean;
}

function PlayerCard({ user, isWinner, label, flip }: PlayerCardProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", flip && "order-last")}>
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.image} />
          <AvatarFallback className={cn("text-white text-sm font-bold", isWinner ? "bg-[#22C55E]" : "bg-[#3B82F6]")}>
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
        {isWinner && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#F59E0B] rounded-full flex items-center justify-center">
            <Trophy className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-[#FAFAFA] truncate max-w-[80px]">{user.name}</p>
        <p className="text-[10px] text-[#71717A]">{label}</p>
        <p className={cn("text-lg font-bold mt-1", isWinner ? "text-[#22C55E]" : "text-[#FAFAFA]")}>
          {user.monthlyWins}
        </p>
      </div>
    </div>
  );
}

interface TodayCardProps {
  user: { name: string; image: string; todaySolved: number; todayPoints: number };
  isWinner: boolean;
  isTie: boolean;
  label: string;
  flip?: boolean;
}

function TodayCard({ user, isWinner, isTie, label, flip }: TodayCardProps) {
  const highlight = isWinner || isTie;
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", flip && "order-last")}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={user.image} />
        <AvatarFallback className={cn("text-white text-sm font-bold", highlight ? "bg-[#22C55E]" : "bg-[#262626]")}>
          {user.name[0]}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-xs font-medium text-[#FAFAFA]">{user.name}</p>
        <p className="text-[10px] text-[#71717A]">{label}</p>
        <p className="text-xs text-[#A1A1AA] mt-1">{user.todaySolved} solved</p>
      </div>
    </div>
  );
}
