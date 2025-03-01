require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

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
  constructor() {
    this.supabase = supabase;
  }
  async generateToken({ permanent = false, expiresIn = 86400 } = {}) {
    const tokenStr = crypto.randomBytes(16).toString("hex");
    const now = new Date();

    let tokenData = {
      token: tokenStr,
      created_at: now.toISOString(),
      activated_at: null,
    };
    if (!permanent) {
      tokenData.expires_in = expiresIn;
      tokenData.expires_at = null;
    } else {
      tokenData.permanent = true;
    }
    const { error } = await supabase.from("tokens").insert([tokenData]);
    if (error) {
      console.error("Error saat menghasilkan token:", error);
      console.log(error);
      return null;
    }
    return tokenStr;
  }

  async checkToken(tokenStr) {
    let { data: tokenData, error } = await this.supabase
      .from("tokens")
      .select("*")
      .eq("token", tokenStr)
      .single();

    if (error || !tokenData) {
      return false;
    }
    if (tokenData.permanent) {
      return true;
    }
    const now = new Date();
    if (!tokenData.activated_at) {
      const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000);
      const { error: updateError } = await this.supabase
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
      tokenData.activated_at = now.toISOString();
      tokenData.expires_at = expiresAt.toISOString();
    }
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      return false;
    }
    return true;
  }

  async deleteToken(tokenStr) {
    const { error } = await supabase
      .from("tokens")
      .delete()
      .eq("token", tokenStr);

    if (error) {
      console.error("Error menghapus token:", error);
      return false;
    }
    return true;
  }

  async extendToken(tokenStr, additionalSeconds) {
  let { data: tokenData, error } = await this.supabase
    .from("tokens")
    .select("*")
    .eq("token", tokenStr)
    .single();
  if (error || !tokenData) {
    return false;
  }
  
  if (tokenData.activated_at) {
    let currentExpiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    if (now > currentExpiresAt) {
      currentExpiresAt = now;
    }
    const newExpiresAt = new Date(currentExpiresAt.getTime() + additionalSeconds * 1000);
    const { error: updateError } = await this.supabase
      .from("tokens")
      .update({ expires_at: newExpiresAt.toISOString() })
      .eq("token", tokenStr);
    if (updateError) {
      console.error("Error saat memperpanjang token:", updateError);
      return false;
    }
  } else {
    const newExpiresIn = tokenData.expires_in + additionalSeconds;
    const { error: updateError } = await this.supabase
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
  }
  return true;
}


  async getTokenInfo(tokenStr) {
    const { data: tokenData, error } = await this.supabase
      .from("tokens")
      .select("*")
      .eq("token", tokenStr)
      .single();
    if (error || !tokenData) {
      return null;
    }
    return tokenData;
  }
}

module.exports = TokenManager;
