export type FeedbackType = "success" | "error" | "warning" | "info";
export type FeedbackEventDetail = { message: string; type?: FeedbackType };

export const GLOBAL_FEEDBACK_EVENT = "smaj:feedback";
export const showFeedback = (message: string, type: FeedbackType = "info") => {
  window.dispatchEvent(new CustomEvent<FeedbackEventDetail>(GLOBAL_FEEDBACK_EVENT, { detail: { message, type } }));
};
