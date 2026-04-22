import { create } from 'zustand';

interface LegalState {
  acceptedTerms: string | null;
  acceptedPrivacy: string | null;
  setAcceptedTerms: (accepted: boolean) => void;
  setAcceptedPrivacy: (accepted: boolean) => void;
  reset: () => void;
}

export const useLegalStore = create<LegalState>((set) => ({
  acceptedTerms: null,
  acceptedPrivacy: null,
  setAcceptedTerms: (accepted) => set({ acceptedTerms: accepted ? new Date().toISOString() : null }),
  setAcceptedPrivacy: (accepted) => set({ acceptedPrivacy: accepted ? new Date().toISOString() : null }),
  reset: () => set({ acceptedTerms: null, acceptedPrivacy: null }),
}));
