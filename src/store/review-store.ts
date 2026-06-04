import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEW_STORAGE_KEY = "ord-review-state";

export type ReviewStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type ReviewState = {
  currentStep: ReviewStep;
  lastReviewedAt: number | null;
};

type ReviewActions = {
  startReview: () => void;
  setStep: (step: number) => void;
  completeReview: () => void;
  resetReview: () => void;
};

function clampStep(step: number): ReviewStep {
  return Math.max(0, Math.min(6, Math.round(step))) as ReviewStep;
}

export const useReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set) => ({
      currentStep: 0,
      lastReviewedAt: null,

      startReview: () => set({ currentStep: 1 }),

      setStep: (step: number) => set({ currentStep: clampStep(step) }),

      completeReview: () => set({ currentStep: 0, lastReviewedAt: Date.now() }),

      resetReview: () => set({ currentStep: 0 }),
    }),
    {
      name: REVIEW_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
