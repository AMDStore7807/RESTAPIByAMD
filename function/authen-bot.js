require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.db_token_SUPABASE_URL;
const supabaseKey = process.env.db_token_NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @param {Object} req - Request object Express.
 * @param {Object} res - Response object Express.
 */
async function authenBotHandler(req, res) {
  console.log("🟢 Handler authenBotHandler dipanggil!");
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password diperlukan" });
    }

    const { data, error } = await supabase
      .from("zayzyn-auth")
      .select("*")
      .eq("USERNAME", username)
      .eq("PASSWORD", password)
      .single();

    if (error || !data) {
      return res.status(401).json({
        ACCESS: false,
        message: "Username atau password salah",
      });
    }

    const response = {
      USERNAME: data.USERNAME,
      OWNER: data.OWNER,
      EMAIL: data.EMAIL,
      ACCESS: data.ACCESS,
      BANNED: data.BANNED,
      BAN_REASON: data.BAN_REASON,
      MAINTENANCE: data.MAINTENANCE,
    };

    return res.json(response);
  } catch (err) {
    console.error("Error saat autentikasi:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { authenBotHandler };
