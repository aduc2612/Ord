import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingStep = 0 | 1 | 2 | 3 | 4;

type OnboardingState = {
  currentStep: OnboardingStep;
  capturedNoteText: string;
  createdTaskTitle: string;
  onboardingComplete: boolean;
  _hydrated: boolean;
};

type OnboardingActions = {
  setStep: (step: OnboardingStep) => void;
  setCapturedNote: (text: string) => void;
  setCreatedTaskTitle: (title: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      currentStep: 0,
      capturedNoteText: "",
      createdTaskTitle: "",
      onboardingComplete: false,
      _hydrated: false,

      setStep: (step) => set({ currentStep: Math.max(0, Math.min(4, step)) as OnboardingStep }),
      setCapturedNote: (text) => set({ capturedNoteText: text }),
      setCreatedTaskTitle: (title) => set({ createdTaskTitle: title }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () =>
        set({
          currentStep: 0,
          capturedNoteText: "",
          createdTaskTitle: "",
          onboardingComplete: false,
        }),
    }),
    {
      name: "ord-onboarding-state",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _hydrated, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state && (state.currentStep < 0 || state.currentStep > 4)) {
          useOnboardingStore.setState({ currentStep: 0 });
        }
        useOnboardingStore.setState({ _hydrated: true });
      },
    },
  ),
);
