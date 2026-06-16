import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { getUserObjectId } from "@/lib/db/getUserObjectId";
import { User, UserProblem, Problem, BuddyRequest } from "@/models";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BuddyUserInfo {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface PendingRequest {
  id: string;
  sender: BuddyUserInfo;
  createdAt: string;
}

export interface SentRequest {
  id: string;
  receiver: BuddyUserInfo;
  status: string;
}

export interface BuddyStatusResult {
  hasBuddy: boolean;
  buddy: BuddyUserInfo | null;
  pendingRequests: PendingRequest[];
  sentRequest: SentRequest | null;
}

export interface BuddyDashboardUser {
  name: string;
  email: string;
  image: string;
  todayPoints: number;
  todaySolved: number;
  monthlyWins: number;
}

export interface CalendarDay {
  date: string;
  winner: "me" | "buddy" | "tie" | "none";
  mePoints: number;
  buddyPoints: number;
}

export interface BuddyDashboard {
  me: BuddyDashboardUser;
  buddy: BuddyDashboardUser;
  todayWinner: "me" | "buddy" | "tie" | "none";
  buddyOfMonth: "me" | "buddy" | "tie" | "none";
  calendar: CalendarDay[];
}

export interface SearchUserResult {
  id: string;
  name: string;
  email: string;
  image: string;
  hasBuddy?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function toUserInfo(u: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  image?: string;
}): BuddyUserInfo {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    image: u.image ?? "",
  };
}

async function findAcceptedBuddyRequest(userId: mongoose.Types.ObjectId) {
  return BuddyRequest.findOne({
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: "accepted",
  }).lean();
}

async function getBuddyUserId(
  userId: mongoose.Types.ObjectId,
  request: { senderId: mongoose.Types.ObjectId; receiverId: mongoose.Types.ObjectId }
): Promise<mongoose.Types.ObjectId> {
  return request.senderId.toString() === userId.toString()
    ? request.receiverId
    : request.senderId;
}

// ─── Point calculation ───────────────────────────────────────────────────────

export async function getDailyPoints(
  userId: mongoose.Types.ObjectId,
  date: Date
): Promise<{ points: number; solved: number }> {
  const { start, end } = toDateRange(date);

  const userProblems = await UserProblem.find({
    userId,
    status: "SOLVED",
    solvedAt: { $gte: start, $lte: end },
  })
    .populate<{ problemId: { difficulty: string } }>("problemId", "difficulty")
    .lean();

  let points = 0;
  let solved = 0;

  for (const up of userProblems) {
    const difficulty = (up.problemId as { difficulty: string } | null)?.difficulty;
    if (difficulty === "Hard") points += 8;
    else if (difficulty === "Medium") points += 4;
    else if (difficulty === "Easy") points += 2;
    solved++;
  }

  return { points, solved };
}

// ─── Main Service Functions ───────────────────────────────────────────────────

export async function getBuddyStatus(
  userId: string,
  email?: string | null
): Promise<BuddyStatusResult> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);

  const accepted = await findAcceptedBuddyRequest(uid);

  if (accepted) {
    const buddyId = await getBuddyUserId(uid, {
      senderId: accepted.senderId as mongoose.Types.ObjectId,
      receiverId: accepted.receiverId as mongoose.Types.ObjectId,
    });
    const buddyUser = await User.findById(buddyId).select("name email image").lean();
    if (!buddyUser) {
      return { hasBuddy: false, buddy: null, pendingRequests: [], sentRequest: null };
    }
    return {
      hasBuddy: true,
      buddy: toUserInfo(buddyUser as { _id: mongoose.Types.ObjectId; name: string; email: string; image?: string }),
      pendingRequests: [],
      sentRequest: null,
    };
  }

  // Pending incoming requests
  const incoming = await BuddyRequest.find({
    receiverId: uid,
    status: "pending",
  })
    .populate<{ senderId: { _id: mongoose.Types.ObjectId; name: string; email: string; image?: string } }>(
      "senderId",
      "name email image"
    )
    .sort({ createdAt: -1 })
    .lean();

  const pendingRequests: PendingRequest[] = incoming.map((r) => ({
    id: r._id.toString(),
    sender: toUserInfo(r.senderId as { _id: mongoose.Types.ObjectId; name: string; email: string; image?: string }),
    createdAt: r.createdAt.toISOString(),
  }));

  // Sent request
  const sent = await BuddyRequest.findOne({
    senderId: uid,
    status: "pending",
  })
    .populate<{ receiverId: { _id: mongoose.Types.ObjectId; name: string; email: string; image?: string } }>(
      "receiverId",
      "name email image"
    )
    .lean();

  const sentRequest: SentRequest | null = sent
    ? {
        id: sent._id.toString(),
        receiver: toUserInfo(sent.receiverId as { _id: mongoose.Types.ObjectId; name: string; email: string; image?: string }),
        status: sent.status,
      }
    : null;

  return { hasBuddy: false, buddy: null, pendingRequests, sentRequest };
}

export async function searchUsers(
  query: string,
  currentUserId: string,
  email?: string | null
): Promise<SearchUserResult[]> {
  await connectDB();
  const uid = await getUserObjectId(currentUserId, email);

  if (!query.trim()) return [];

  // Find current buddy to exclude
  const accepted = await findAcceptedBuddyRequest(uid);
  const buddyId = accepted
    ? await getBuddyUserId(uid, {
        senderId: accepted.senderId as mongoose.Types.ObjectId,
        receiverId: accepted.receiverId as mongoose.Types.ObjectId,
      })
    : null;

  const regex = new RegExp(query.trim(), "i");
  const users = await User.find({
    $or: [{ name: regex }, { email: regex }],
    _id: { $ne: uid },
  })
    .select("name email image")
    .limit(10)
    .lean();

  const results: SearchUserResult[] = [];

  for (const u of users) {
    const userId = (u._id as mongoose.Types.ObjectId).toString();
    const isBuddy = buddyId ? userId === buddyId.toString() : false;

    // Check if this user already has a buddy
    const theirAccepted = await findAcceptedBuddyRequest(u._id as mongoose.Types.ObjectId);

    results.push({
      id: userId,
      name: u.name,
      email: u.email,
      image: u.image ?? "",
      hasBuddy: isBuddy || !!theirAccepted,
    });
  }

  return results;
}

export async function getBuddyDashboard(
  userId: string,
  email?: string | null
): Promise<BuddyDashboard | null> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);

  const accepted = await findAcceptedBuddyRequest(uid);
  if (!accepted) return null;

  const buddyId = await getBuddyUserId(uid, {
    senderId: accepted.senderId as mongoose.Types.ObjectId,
    receiverId: accepted.receiverId as mongoose.Types.ObjectId,
  });

  const [meUser, buddyUser] = await Promise.all([
    User.findById(uid).select("name email image").lean(),
    User.findById(buddyId).select("name email image").lean(),
  ]);

  if (!meUser || !buddyUser) return null;

  const today = new Date();

  // Build last 30 days
  const days: CalendarDay[] = [];
  let meMonthlyWins = 0;
  let buddyMonthlyWins = 0;

  const nowMonth = today.getMonth();
  const nowYear = today.getFullYear();

  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    day.setHours(0, 0, 0, 0);

    const [meData, buddyData] = await Promise.all([
      getDailyPoints(uid, day),
      getDailyPoints(buddyId, day),
    ]);

    let winner: "me" | "buddy" | "tie" | "none" = "none";
    if (meData.points === 0 && buddyData.points === 0) {
      winner = "none";
    } else if (meData.points === buddyData.points) {
      winner = "tie";
    } else if (meData.points > buddyData.points) {
      winner = "me";
    } else {
      winner = "buddy";
    }

    // Count monthly wins for current month
    if (day.getMonth() === nowMonth && day.getFullYear() === nowYear) {
      if (winner === "me") meMonthlyWins++;
      else if (winner === "buddy") buddyMonthlyWins++;
      else if (winner === "tie") {
        meMonthlyWins++;
        buddyMonthlyWins++;
      }
    }

    days.push({
      date: day.toISOString().split("T")[0],
      winner,
      mePoints: meData.points,
      buddyPoints: buddyData.points,
    });
  }

  const todayData = days[days.length - 1];

  // Today winner
  let todayWinner: "me" | "buddy" | "tie" | "none" = "none";
  if (todayData.mePoints === 0 && todayData.buddyPoints === 0) {
    todayWinner = "none";
  } else if (todayData.mePoints === todayData.buddyPoints) {
    todayWinner = "tie";
  } else if (todayData.mePoints > todayData.buddyPoints) {
    todayWinner = "me";
  } else {
    todayWinner = "buddy";
  }

  // Buddy of the month
  let buddyOfMonth: "me" | "buddy" | "tie" | "none" = "none";
  if (meMonthlyWins === 0 && buddyMonthlyWins === 0) {
    buddyOfMonth = "none";
  } else if (meMonthlyWins === buddyMonthlyWins) {
    buddyOfMonth = "tie";
  } else if (meMonthlyWins > buddyMonthlyWins) {
    buddyOfMonth = "me";
  } else {
    buddyOfMonth = "buddy";
  }

  const [todayMe, todayBuddy] = await Promise.all([
    getDailyPoints(uid, today),
    getDailyPoints(buddyId, today),
  ]);

  return {
    me: {
      name: (meUser as { name: string }).name,
      email: (meUser as { email: string }).email,
      image: (meUser as { image?: string }).image ?? "",
      todayPoints: todayMe.points,
      todaySolved: todayMe.solved,
      monthlyWins: meMonthlyWins,
    },
    buddy: {
      name: (buddyUser as { name: string }).name,
      email: (buddyUser as { email: string }).email,
      image: (buddyUser as { image?: string }).image ?? "",
      todayPoints: todayBuddy.points,
      todaySolved: todayBuddy.solved,
      monthlyWins: buddyMonthlyWins,
    },
    todayWinner,
    buddyOfMonth,
    calendar: days,
  };
}
