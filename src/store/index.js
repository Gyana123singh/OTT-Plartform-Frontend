import { configureStore, createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: 'dark',
    language: 'en',
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    }
  }
});

export const { setUser, logout } = authSlice.actions;
export const { toggleTheme, setLanguage } = themeSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    theme: themeSlice.reducer,
  },
});
