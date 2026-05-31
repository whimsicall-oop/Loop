import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Clerk → Postgres user sync webhook.
 * Configure in the Clerk dashboard with events: user.created, user.updated,
 * user.deleted, pointing at /api/webhooks/clerk, and set CLERK_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  let evt: WebhookEvent;
  try {
    evt = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses?.[0]?.email_address ?? `${id}@placeholder.local`;
      await db.user.upsert({
        where: { clerkId: id },
        update: { email, firstName: first_name, lastName: last_name, imageUrl: image_url },
        create: { clerkId: id, email, firstName: first_name, lastName: last_name, imageUrl: image_url },
      });
      break;
    }
    case "user.deleted": {
      if (evt.data.id) {
        await db.user.deleteMany({ where: { clerkId: evt.data.id } });
      }
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
