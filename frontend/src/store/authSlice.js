import { createSlice } from "@reduxjs/toolkit";

const storedToken = localStorage.getItem("brain_token");
const storedUser = localStorage.getItem("brain_user");

const initialState = {
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("brain_token", action.payload.token);
      localStorage.setItem("brain_user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("brain_token");
      localStorage.removeItem("brain_user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
