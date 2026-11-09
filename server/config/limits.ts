/** Hard limits enforced by the API, independent of what the client claims. */
export const SERVER_LIMITS = Object.freeze({
  /*
   * JSON body size per route. The app compresses photos to ~80–300 KB and
   * records at most 45 s of 16 kHz mono WAV (~1.4 MB), so these leave room for
   * base64 overhead while rejecting oversized bodies before they are parsed.
   */
  bodyLimits: Object.freeze({
    generateRecipe: '6mb',
    transcribe: '4.5mb',
    challenge: '2kb',
    verifyEmail: '2kb',
    /** E-mail + password (setup and login). */
    auth: '2kb',
    /** Cakto payloads are a few KB; Webhook V2 may batch several orders. */
    webhook: '256kb',
  }),
  ingredientsMaxChars: 2_000,
  avoidRecipesMax: 5,
  avoidRecipeMaxChars: 120,
  imageMaxBytes: 4 * 1024 * 1024,
  audioMaxBytes: 3 * 1024 * 1024,
  ageMin: 5,
  ageMax: 120,
  dislikedMaxItems: 15,
  dislikedMaxChars: 40,
  rateLimitWindowMs: 60_000,

  /* Human check ("Verificação rápida"). */
  challengeOptions: 6,
  challengeTtlMs: 5 * 60_000,
  challengeRequestsPerMinute: 20,
  challengeVerificationsPerMinute: 10,
  humanTokenTtlMs: 30 * 24 * 60 * 60_000,
  humanTokenMaxChars: 512,
  /** AI calls (recipes + transcriptions) allowed per verified browser per hour, on top of the per-IP limit. */
  aiRequestsPerHumanPerHour: 40,

  /* Paid access (Cakto webhook + Upstash Redis). */
  emailMaxChars: 254,
  accessTokenMaxChars: 1_024,
  /** Lookups per IP per minute: slows down guessing which e-mails are buyers. */
  verifyEmailPerMinute: 10,
  webhookPerMinute: 120,
  /** Cakto signs "timestamp.body"; older deliveries are rejected as replays. */
  webhookToleranceSeconds: 5 * 60,
  /** Orders handled per delivery (Webhook V2 sends an array). */
  webhookMaxItems: 50,
  /** Refunded orders are remembered this long, so a late purchase_approved retry cannot re-grant them. */
  refundMemorySeconds: 180 * 24 * 60 * 60,
  /** Revocation check cache for the AI routes (positive / negative answers). */
  accessCacheMs: 10 * 60_000,
  accessNegativeCacheMs: 60_000,
  accessCacheMaxEntries: 5_000,
  upstashTimeoutMs: 5_000,

  /* First-access password (no e-mail sending) and the HttpOnly session cookie. */
  passwordMinChars: 8,
  passwordMaxChars: 128,
  /** Password setups + logins per IP per minute. */
  authPerMinute: 10,
  /** Wrong passwords per e-mail before a temporary lock, and how long the lock lasts. */
  loginMaxFailures: 5,
  loginLockSeconds: 15 * 60,
  /** GET /api/auth/session extends sessions closer than this to their expiry. */
  sessionRenewBeforeMs: 15 * 24 * 60 * 60_000,
});
