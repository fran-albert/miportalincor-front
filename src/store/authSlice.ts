import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp?: number;
}

interface TwoFactorState {
    requires2FA: boolean;
    twoFactorToken: string | null;
    maskedPhone: string | null;
    expiresIn: number | null;
}

interface AuthState {
    user: any;
    token: string | null;
    tokenExpiration: string | null;
    isAuthenticated: boolean;
    twoFactor: TwoFactorState;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("authToken") || null,
    tokenExpiration: localStorage.getItem("tokenExpiration") || null,
    isAuthenticated: !!localStorage.getItem("authToken"),
    twoFactor: {
        requires2FA: false,
        twoFactorToken: null,
        maskedPhone: null,
        expiresIn: null,
    },
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
                state.tokenExpiration = expirationTime.toString();

                localStorage.setItem("authToken", action.payload.token);
                localStorage.setItem("tokenExpiration", expirationTime.toString());
            } else {
                console.error('Token does not have an expiration date.');
            }
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiration = null;
            localStorage.removeItem("authToken");
            localStorage.removeItem("tokenExpiration");
        },
        updateTokens: (state, action) => {
            const decodedToken = jwtDecode<DecodedToken>(action.payload.token);
            if (decodedToken.exp) {
                const expirationTime = decodedToken.exp * 1000;

                state.token = action.payload.token;
                state.tokenExpiration = expirationTime.toString();

                localStorage.setItem("authToken", action.payload.token);
                localStorage.setItem("tokenExpiration", expirationTime.toString());
            }
        },
        setTwoFactorRequired: (state, action: PayloadAction<{
            twoFactorToken: string;
            maskedPhone: string;
            expiresIn: number;
        }>) => {
            state.twoFactor.requires2FA = true;
            state.twoFactor.twoFactorToken = action.payload.twoFactorToken;
            state.twoFactor.maskedPhone = action.payload.maskedPhone;
            state.twoFactor.expiresIn = action.payload.expiresIn;
        },
        clearTwoFactor: (state) => {
            state.twoFactor.requires2FA = false;
            state.twoFactor.twoFactorToken = null;
            state.twoFactor.maskedPhone = null;
            state.twoFactor.expiresIn = null;
        },
    },
});

export const { loginSuccess, setUser, logout, updateTokens, setTwoFactorRequired, clearTwoFactor } = authSlice.actions;
export default authSlice.reducer;
