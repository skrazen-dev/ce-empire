import { supabaseAdmin } from "./supabase";

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByUsername(username: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined; // No rows found
      throw error;
    }

    return data;
  } catch (error) {
    console.error("[Database] Failed to get user by username:", error);
    return undefined;
  }
}

export async function getUserById(id: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("[Database] Failed to get user by id:", error);
    return undefined;
  }
}

export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
  role: "user" | "admin" = "user"
): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        username,
        email,
        password_hash: passwordHash,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    return data.id as number;
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

export async function updateUserLastSignedIn(id: number): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        last_signed_in: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
  }
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", username)
      .limit(1);

    if (error) throw error;

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error("[Database] Failed to check username:", error);
    return false;
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (error) throw error;

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error("[Database] Failed to check email:", error);
    return false;
  }
}
