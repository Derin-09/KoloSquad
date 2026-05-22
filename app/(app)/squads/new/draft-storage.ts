export const SQUAD_DRAFT_STORAGE_KEY = "squad-create-draft";

export type StepOneDraftValues = {
  squadName: string;
  goalAmount: string;
  duration: "week(s)" | "month(s)" | "year(s)";
  durationNumber: number;
};

export type StepTwoDraftValues = {
  memberCount: number;
};

export type SquadDraft = {
  currentStep?: number;
  stepOne?: StepOneDraftValues;
  stepTwo?: StepTwoDraftValues;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSquadDraft(): SquadDraft | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(SQUAD_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SquadDraft;
  } catch {
    return null;
  }
}

export function setSquadDraft(nextDraft: SquadDraft) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SQUAD_DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
}

export function patchSquadDraft(partial: SquadDraft) {
  const current = getSquadDraft() ?? {};
  setSquadDraft({ ...current, ...partial });
}

export function clearSquadDraft() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SQUAD_DRAFT_STORAGE_KEY);
}
