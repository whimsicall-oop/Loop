import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Demo mode (DEMO_MODE=true) bypasses Clerk and uses the seeded demo user.
 * Intended only for local previews/screenshots — never enable in production.
 */
export function demoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

async function demoUser(): Promise<User | null> {
  return db.user.findUnique({ where: { clerkId: "demo_user_seed" } });
}

/**
 * Returns the Postgres User row for the signed-in Clerk user, creating it on
 * first access. This "lazy sync" means the app works even before the Clerk
 * webhook is configured; the webhook keeps records fresh in production.
 */
export async function currentDbUser(): Promise<User | null> {
  if (demoMode()) return demoUser();

  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerk = await currentUser();
  if (!clerk) return null;

  const email =
    clerk.primaryEmailAddress?.emailAddress ??
    clerk.emailAddresses[0]?.emailAddress ??
    `${userId}@placeholder.local`;

  return db.user.upsert({
    where: { clerkId: userId },
    update: {
      email,
      firstName: clerk.firstName,
      lastName: clerk.lastName,
      imageUrl: clerk.imageUrl,
    },
    create: {
      clerkId: userId,
      email,
      firstName: clerk.firstName,
      lastName: clerk.lastName,
      imageUrl: clerk.imageUrl,
    },
  });
}

/** Like {@link currentDbUser} but throws — for server actions that require auth. */
export async function requireDbUser(): Promise<User> {
  const user = await currentDbUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
