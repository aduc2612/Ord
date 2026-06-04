import { create } from "zustand";
import type { FilterSelections } from "@/components/filter-sheet";

type PendingFiltersState = {
  pendingFilters: FilterSelections | null;
};

type PendingFiltersActions = {
  setPendingFilters: (filters: FilterSelections) => void;
  clearPendingFilters: () => void;
};

export const usePendingFiltersStore = create<
  PendingFiltersState & PendingFiltersActions
>()((set) => ({
  pendingFilters: null,

  setPendingFilters: (filters) => set({ pendingFilters: filters }),

  clearPendingFilters: () => set({ pendingFilters: null }),
}));
