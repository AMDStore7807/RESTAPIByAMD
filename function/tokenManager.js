const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Pastikan environment variables SUPABASE_URL dan SUPABASE_ANON_KEY sudah di-set!
const SUPABASE_URL = process.env.db_token_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.db_token_NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "SUPABASE_URL atau SUPABASE_ANON_KEY belum di-set di environment variables."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class TokenManager {
  // Fungsi untuk menghasilkan token baru
  async generateToken(expiresIn = 86400) {
    // default: 86400 detik = 1 hari
    const tokenStr = crypto.randomBytes(16).toString("hex");
    const now = new Date();
    const { error } = await supabase.from("tokens").insert([
      {
        token: tokenStr,
        created_at: now.toISOString(),
        activated_at: null,
        expires_in: expiresIn,
        expires_at: null,
        revoked: false,
      },
    ]);
    if (error) {
      console.error("Error saat menghasilkan token:", error);
      return null;
    }
    return tokenStr;
  }

  // Fungsi untuk mengecek validitas token. Saat token dicek pertama kali, masa berlakunya diaktifkan.
  async checkToken(tokenStr) {
    let { data: tokenData, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("token", tokenStr)
      .single();

    if (error || !tokenData) {
      console.log("Token tidak ditemukan.");
      return false;
    }
    if (tokenData.revoked) {
      console.log("Token telah dicabut.");
      return false;
    }
    const now = new Date();
    if (!tokenData.activated_at) {
      // Aktifkan token saat pertama kali dicek
      const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000);
      const { error: updateError } = await supabase
        .from("tokens")
        .update({
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("token", tokenStr);
      if (updateError) {
        console.error("Error saat mengaktifkan token:", updateError);
        return false;
      }
      console.log("Token baru saja diaktifkan. Masa berlaku dimulai!");
      tokenData.activated_at = now.toISOString();
      tokenData.expires_at = expiresAt.toISOString();
    }
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      console.log("Token telah kadaluarsa.");
      return false;
    }
    console.log(
      "Token valid dan masih aktif. (Setia lebih dari password yang sering di-reset!)"
    );
    return true;
  }

  // Fungsi untuk mencabut token
  async revokeToken(tokenStr) {
    const { error } = await supabase
      .from("tokens")
      .update({ revoked: true })
      .eq("token", tokenStr);
    if (error) {
      console.error("Error saat mencabut token:", error);
      return false;
    }
    console.log("Token telah dicabut.");
    return true;
  }

  // Fungsi untuk memperpanjang masa berlaku token
  async extendToken(tokenStr, additionalSeconds) {
    let { data: tokenData, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("token", tokenStr)
      .single();
    if (error || !tokenData) {
      console.log("Token tidak ditemukan.");
      return false;
    }
    if (tokenData.revoked) {
      console.log("Token telah dicabut, tidak bisa diperpanjang.");
      return false;
    }
    if (tokenData.activated_at) {
      const currentExpiresAt = new Date(tokenData.expires_at);
      const newExpiresAt = new Date(
        currentExpiresAt.getTime() + additionalSeconds * 1000
      );
      const { error: updateError } = await supabase
        .from("tokens")
        .update({ expires_at: newExpiresAt.toISOString() })
        .eq("token", tokenStr);
      if (updateError) {
        console.error("Error saat memperpanjang token:", updateError);
        return false;
      }
      console.log(`Masa berlaku token diperpanjang hingga ${newExpiresAt}.`);
    } else {
      const newExpiresIn = tokenData.expires_in + additionalSeconds;
      const { error: updateError } = await supabase
        .from("tokens")
        .update({ expires_in: newExpiresIn })
        .eq("token", tokenStr);
      if (updateError) {
        console.error(
          "Error saat memperpanjang token (belum diaktifkan):",
          updateError
        );
        return false;
      }
      console.log(
        `Masa berlaku token (belum diaktifkan) diperpanjang menjadi ${newExpiresIn} detik.`
      );
    }
    return true;
  }

  // Fungsi untuk mendapatkan informasi token
  async getTokenInfo(tokenStr) {
    const { data: tokenData, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("token", tokenStr)
      .single();
    if (error || !tokenData) {
      console.log("Token tidak ditemukan.");
      return null;
    }
    return tokenData;
  }
}
