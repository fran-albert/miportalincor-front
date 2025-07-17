import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { AuthUtils } from '@/utils/auth';

interface DecodedToken {
    exp?: number;
}

const initialState = {
    user: null,
    token: AuthUtils.getAuthToken(),
    tokenExpiration: AuthUtils.getTokenExpiration(),
    isAuthenticated: AuthUtils.isTokenValid(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const decodedToken = jwtDecode<DecodedToken>(action.payload.token);
            if (decodedToken.exp) {
                const expirationTime = decodedToken.exp * 1000;

                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.tokenExpiration = expirationTime;

                AuthUtils.setAuthToken(action.payload.token);
            } else {
                // Token sin fecha de expiración no es válido
                state.token = null;
                state.isAuthenticated = false;
                state.tokenExpiration = null;
            }
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiration = null;
            AuthUtils.removeAuthToken();
        },
    },
});

export const { loginSuccess, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
