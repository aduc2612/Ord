/**
 * Feedback email address. Update this to your actual support email.
 */
export const FEEDBACK_EMAIL = "anhducams@gmail.com";

export const feedbackTemplates = {
  errorReport: {
    icon: "bug-outline" as const,
    label: "Error report",
    subject: "Ord - Bug Report",
    body: [
      "Hi, I'd like to report a bug.",
      "",
      "Steps to reproduce:",
      "1. ",
      "2. ",
      "3. ",
      "",
      "Expected behavior:",
      "",
      "",
      "Actual behavior:",
      "",
      "",
      "Device info (Android 16, iOS 26, etc...):",
      "",
      "",
    ].join("\n"),
  },
  featureRequest: {
    icon: "bulb-outline" as const,
    label: "Feature request",
    subject: "Ord - Feature Request",
    body: [
      "Hi, I'd like to suggest a feature.",
      "",
      "What problem does this solve?",
      "",
      "",
      "Describe the feature:",
      "",
      "",
    ].join("\n"),
  },
  other: {
    icon: "chatbubble-outline" as const,
    label: "Other",
    subject: "Ord - Feedback",
    body: ["Hi, I'd like to share some feedback.", "", "", ""].join("\n"),
  },
} as const;

export type FeedbackType = keyof typeof feedbackTemplates;
