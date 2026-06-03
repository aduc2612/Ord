import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEW_STORAGE_KEY = "ord-review-state";

type ReviewState = {
  currentStep: number; // 0 = not started / completed, 1–6 = in-progress
  lastReviewedAt: number | null;
};

type ReviewActions = {
  startReview: () => void;
  setStep: (step: number) => void;
  completeReview: () => void;
  resetReview: () => void;
};

export const useReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set) => ({
      currentStep: 0,
      lastReviewedAt: null,

      startReview: () => set({ currentStep: 1 }),

      setStep: (step: number) => set({ currentStep: step }),

      completeReview: () =>
        set({ currentStep: 0, lastReviewedAt: Date.now() }),

      resetReview: () => set({ currentStep: 0 }),
    }),
    {
      name: REVIEW_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
