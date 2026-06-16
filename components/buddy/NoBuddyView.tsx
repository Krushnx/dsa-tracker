"use client";

import { useState, useTransition, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Search, UserPlus, Users, Clock, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendBuddyRequest, respondToBuddyRequest } from "@/lib/actions/buddy.actions";
import type { BuddyStatusResult, SearchUserResult } from "@/lib/services/buddy.service";

interface Props {
  status: BuddyStatusResult;
  onStatusChange: () => Promise<void>;
}

export function NoBuddyView({ status, onStatusChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 400);

  // Search users
  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/buddy/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.users ?? []);
    } finally {
      setSearching(false);
    }
  }, []);

  // Trigger search on debounced change
  useState(() => { handleSearch(debouncedQuery); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useCallback(() => { handleSearch(debouncedQuery); }, [debouncedQuery]);

  // Use useEffect pattern manually via state
  const [prevQuery, setPrevQuery] = useState("");
  if (debouncedQuery !== prevQuery) {
    setPrevQuery(debouncedQuery);
    handleSearch(debouncedQuery);
  }

  const handleSendRequest = (userId: string) => {
    startTransition(async () => {
      const r = await sendBuddyRequest(userId);
      if (r.success) { toast.success(r.message); await onStatusChange(); }
      else toast.error(r.message);
    });
  };

  const handleRespond = (requestId: string, action: "accept" | "decline") => {
    startTransition(async () => {
      const r = await respondToBuddyRequest(requestId, action);
      if (r.success) { toast.success(r.message); await onStatusChange(); }
      else toast.error(r.message);
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Pending incoming requests */}
      {status.pendingRequests.length > 0 && (
        <div className="bg-[#111111] border border-[#F59E0B]/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-medium text-[#FAFAFA]">
              Buddy Requests ({status.pendingRequests.length})
            </h3>
          </div>
          <div className="space-y-3">
            {status.pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-3 p-3 bg-[#171717] rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={req.sender.image} />
                    <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                      {req.sender.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#FAFAFA]">{req.sender.name}</p>
                    <p className="text-xs text-[#71717A]">{req.sender.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(req.id, "accept")}
                    disabled={pending}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, "decline")}
                    disabled={pending}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent request */}
      {status.sentRequest && (
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#A1A1AA]" />
            <h3 className="text-sm font-medium text-[#A1A1AA]">Pending Request Sent</h3>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#171717] rounded-xl">
            <Avatar className="w-9 h-9">
              <AvatarImage src={status.sentRequest.receiver.image} />
              <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                {status.sentRequest.receiver.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">{status.sentRequest.receiver.name}</p>
              <p className="text-xs text-[#71717A]">Waiting for response…</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-sm font-medium text-[#FAFAFA]">Find a DSA Buddy</h3>
        </div>
        <p className="text-xs text-[#71717A] mb-4">
          Search by name or email. Both you and your buddy can have only one buddy at a time.
        </p>

        <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] focus-within:border-[#3B82F6]/50 transition-colors mb-4">
          <Search className="w-4 h-4 text-[#71717A] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none"
          />
          {searching && (
            <span className="w-3.5 h-3.5 border border-[#71717A] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 p-3 bg-[#171717] rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#FAFAFA]">{user.name}</p>
                    <p className="text-xs text-[#71717A]">{user.email}</p>
                    {user.hasBuddy && (
                      <p className="text-[10px] text-[#F59E0B]">Already has a buddy</p>
                    )}
                  </div>
                </div>
                {!user.hasBuddy && !status.sentRequest && (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={pending}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/20 transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Send Request
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {query && !searching && results.length === 0 && (
          <p className="text-xs text-[#71717A] text-center py-4">No users found for &quot;{query}&quot;</p>
        )}
      </div>
    </div>
  );
}
