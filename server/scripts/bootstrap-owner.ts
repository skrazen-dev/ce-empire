import "dotenv/config";
import { supabaseAdmin } from "../supabase";

/**
 * Bootstrap the platform owner from environment variables — no hardcoded
 * passwords, no auth bypass. Promotes an existing user (matched by email) to
 * the `admin` role using the existing role system.
 *
 * Env:
 *   OWNER_EMAIL (required) — email of the user to promote.
 *   OWNER_NAME  (optional) — display name to set on that user.
 *
 * Run after the owner has signed in at least once (so the row exists):
 *   OWNER_EMAIL=you@example.com OWNER_NAME="Owner" npx tsx server/scripts/bootstrap-owner.ts
 */
async function bootstrapOwner() {
  const email = process.env.OWNER_EMAIL;
  const name = process.env.OWNER_NAME;

  if (!email) {
    console.error("[bootstrap-owner] OWNER_EMAIL is not set; nothing to do.");
    process.exit(1);
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[bootstrap-owner] lookup failed:", error.message);
    process.exit(1);
  }
  if (!user) {
    console.error(
      `[bootstrap-owner] no user with email ${email}. Ask them to sign in once first, then re-run.`
    );
    process.exit(1);
  }

  const updates: Record<string, unknown> = {
    role: "admin",
    updated_at: new Date().toISOString(),
  };
  if (name) updates.name = name;

  const { error: upErr } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", user.id);
  if (upErr) {
    console.error("[bootstrap-owner] promote failed:", upErr.message);
    process.exit(1);
  }

  // Idempotently record the owner in admin_users.
  await supabaseAdmin
    .from("admin_users")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  console.log(`[bootstrap-owner] ${email} (id ${user.id}) is now admin.`);
  process.exit(0);
}

bootstrapOwner();
