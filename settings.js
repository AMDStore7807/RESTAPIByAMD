const expiryDurations = {};
for (let i = 1; i <= 30; i++) {
  expiryDurations[`${i}day`] = i * 24 * 60 * 60 * 1000;
}
global.expiryDurations = expiryDurations;
global.creator = "AMD STORE";
global.apikey = [
  { key: "amdsukarulzz", expired: "permanent", createdAt: new Date() },
  { key: "tempkey123", expired: "1day", createdAt: new Date() },
  { key: "tempkey1237", expired: "21day", createdAt: new Date() },
];
