import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

interface UserINT {
  userID: string;
  email: string;
  nick: string;
  isverified: boolean;
  honor: number;
  problems_completed: number;
  comments_count: number;
  mostUsedLanguage: string;
  role: string;
  contributor_flag: boolean;
  mentor_flag: boolean;
  verifier_flag: boolean;
  bug_hunter_flag: boolean;
}

interface AuthStore {
  user: UserINT | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  message: string | null;
  isLoggedIn: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<any>;
  checkAuth: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  isLoggedIn: false,


  sendVerificationEmail: async () => {
    set({error: null, isLoading: true});
    try{
      const response = await axios.get(`http://localhost:5000/api/auth/sendVerificationEmailAgain`);
      set({user: response.data.user, isAuthenticated: true, isLoading: false })
    }catch (error: any){
      set({ error: null});
    }
  },

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/signup`, { email, password, name });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/login`, { email, password });
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
        isLoggedIn: true,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`http://localhost:5000/api/auth/logout`);
      set({ user: null, isAuthenticated: false, error: null, isLoading: false, isLoggedIn: false, });
      window.location.href = "/";
    } catch (error: any) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/verifycode`, { code });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/checkauth`);
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false, isLoggedIn: true });
      console.log(response.data.user);
    } catch (error: any) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },
}));
