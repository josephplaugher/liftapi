import * as Sentry from "@sentry/nestjs"

Sentry.init({
  dsn: "https://c24b58f6ab2684c36564a713c1af1b6f@o4511402718396416.ingest.us.sentry.io/4511402731831296",

  // Send structured logs to Sentry
  enableLogs: true,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});