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
      state.user =JSON.parse(localStorage.getItem('user')!);
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.user = null;
    },
    updateAvatar(state, {payload}) {
      let user = JSON.parse(localStorage.getItem('user')!);
      localStorage.setItem('user', JSON.stringify(user)); 
      user = {...user, avatar : payload}
      state.user = user;
    },
    updateUser(state, {payload}) {
      state.user = payload;
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
});

export const { login, logout, updateAvatar, updateUser } = authSlice.actions;
export default authSlice;
