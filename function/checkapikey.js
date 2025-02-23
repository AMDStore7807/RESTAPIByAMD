// Function to generate an API key with an expiration date
function generateApiKey(daysValid) {
    if (daysValid < 1 || daysValid > 30) {
        throw new Error("Days valid must be between 1 and 30.");
    }
    const apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysValid);
    return { apiKey, expirationDate };
}

// Function to check if an API key is valid, expired, or invalid
function checkApiKey(apiKeyObj) {
    const currentDate = new Date();
    if (!apiKeyObj || !apiKeyObj.apiKey || !apiKeyObj.expirationDate) {
        return "Invalid API key object.";
    }
    if (currentDate > new Date(apiKeyObj.expirationDate)) {
        return "API key expired.";
    }
    return "API key is valid.";
}

// Additional feature: Renew an API key
function renewApiKey(apiKeyObj, additionalDays) {
    if (additionalDays < 1 || additionalDays > 30) {
        throw new Error("Additional days must be between 1 and 30.");
    }
    const currentDate = new Date();
    if (currentDate > new Date(apiKeyObj.expirationDate)) {
        return "Cannot renew an expired API key.";
    }
    const newExpirationDate = new Date(apiKeyObj.expirationDate);
    newExpirationDate.setDate(newExpirationDate.getDate() + additionalDays);
    return { ...apiKeyObj, expirationDate: newExpirationDate };
}

// Example usage
const myApiKey = generateApiKey(15);
console.log(myApiKey);
console.log(checkApiKey(myApiKey));
const renewedApiKey = renewApiKey(myApiKey, 5);
console.log(renewedApiKey);
console.log(checkApiKey(renewedApiKey));