const axios = require("axios");

const simtalk = (text, language) => {
  return new Promise((resolve, reject) => {
    if (typeof text !== "string") {
      return reject(new Error("Text must be a string"));
    }

    const supportedLanguages = [
      "vn",
      "en",
      "id",
      "ko",
      "ru",
      "ar",
      "ms",
      "es",
      "pt",
      "de",
      "th",
      "ja",
      "fr",
      "sv",
      "tr",
      "da",
      "nb",
      "it",
      "nl",
      "fi",
      "ml",
      "hi",
      "pl",
      "ro",
      "si",
      "fy",
      "kk",
      "cs",
      "hu",
      "lt",
      "be",
      "bg",
      "is",
      "uk",
      "jv",
      "eu",
      "rw",
      "or",
      "bn",
      "gn",
      "kn",
      "my",
      "sk",
      "gl",
      "gu",
      "ps",
      "ka",
      "et",
      "tg",
      "as",
      "mr",
      "ne",
      "ur",
      "uz",
      "cx",
    ];

    if (!supportedLanguages.includes(language)) {
      return reject(new Error("Language not supported"));
    }

    axios
      .post(
        "https://api.simsimi.vn/v2/simtalk",
        new URLSearchParams({ text, lc: language })
      )
      .then((response) => resolve(response.data))
      .catch(reject);
  });
};

module.exports = { simtalk };
