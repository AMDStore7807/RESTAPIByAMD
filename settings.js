const expiryDurations = {};
for (let i = 1; i <= 30; i++) {
  expiryDurations[`${i}day`] = i * 24 * 60 * 60 * 1000;
}
global.expiryDurations = expiryDurations;
global.creator = "AMD STORE";
