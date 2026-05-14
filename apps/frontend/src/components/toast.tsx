'use client';

import { create } from 'zustand';

type ToastState = {
  message?: string;
  show: (message: string) => void;
};

export const useToast = create<ToastState>((set) => ({
  show: (message) => {
    set({ message });
    window.setTimeout(() => set({ message: undefined }), 3200);
  },
}));

export function Toast() {
  const message = useToast((state) => state.message);
  if (!message) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl bg-zinc-950 px-4 py-3 text-sm text-white shadow-xl dark:bg-white dark:text-zinc-950">
      {message}
    </div>
  );
}
