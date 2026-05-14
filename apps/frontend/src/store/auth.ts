'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; email: string; name: string; role: string };

type AuthState = {
  token?: string;
  user?: User;
  setSession: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: undefined, user: undefined }),
    }),
    { name: 'aldrava-auth' },
  ),
);
