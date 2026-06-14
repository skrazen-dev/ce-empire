import { supabaseAdmin } from "./supabase";

/**
 * Simple password hashing using SHA-256 (built-in crypto)
 * For production, use bcrypt or Supabase Auth
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Register new user
 */
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; userId?: number; error?: string }> {
  try {
    // Check if user exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return { success: false, error: "Username already exists" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        username,
        email,
        password_hash: passwordHash,
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_signed_in: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, userId: data.id };
  } catch (error) {
    console.error("[Auth] Register error:", error);
    return { success: false, error: "Registration failed" };
  }
}

/**
 * Login user
 */
export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; userId?: number; username?: string; role?: string; error?: string }> {
  try {
    // Get user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return { success: false, error: "Invalid username or password" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    // Update last signed in
    await supabaseAdmin
      .from("users")
      .update({ last_signed_in: new Date().toISOString() })
      .eq("id", user.id);

    return {
      success: true,
      userId: user.id,
      username: user.username,
      role: user.role,
    };
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return { success: false, error: "Login failed" };
  }
}
