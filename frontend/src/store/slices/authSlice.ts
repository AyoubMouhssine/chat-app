import { createSlice } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  isAuthenticated:boolean
  user:User|null
}

const initialState: AuthState = {
  isAuthenticated : Boolean(localStorage.getItem('token')),
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, {payload}){
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice;
