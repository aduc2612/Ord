export type FabType = "note" | "project" | "tag";

export type FabConfig = {
  type: FabType;
  title: string;
  message?: string;
  placeholder: string;
  confirmLabel: string;
};
