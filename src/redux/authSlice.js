import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI, setAuthToken, clearAuthToken } from "../API/drugSpeakAPI";

const initialState = {
	user: null,
	token: null,
	isLoggedIn: false,
	status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
	error: null,
};

export const registerUser = createAsyncThunk(
	"auth/register",
	async (userData, { rejectWithValue }) => {
		try {
			console.log("Register payload:", { userData });
			const data = await authAPI.signUp({
				username: userData.username,
				email: userData.email,
				password: userData.password,
				gender: userData.gender || "unspecified",
			});
			console.log("Register response:", data);
			return data; // Make sure to return the data
		} catch (error) {
			console.log("Registration error:", error.message);
			return rejectWithValue(error.message || "Registration failed");
		}
	}
);

export const loginUser = createAsyncThunk(
	"auth/login",
	async (credentials, { rejectWithValue }) => {
		try {
			const data = await authAPI.signIn({
				email: credentials.email,
				password: credentials.password,
			});
			console.log(data);
			return data; // Make sure to return the data
		} catch (error) {
			return rejectWithValue(error.message || "Invalid email or password");
		}
	}
);

export const updateUser = createAsyncThunk(
	"auth/update",
	async ({ userId, updates }, { rejectWithValue }) => {
		try {
			const data = await authAPI.updateUserProfile(userId, updates);
			return data; // Return the updated user data
		} catch (error) {
			return rejectWithValue(error.message || "Failed to update profile");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logoutUser: (state) => {
			state.user = null;
			state.token = null;
			state.isLoggedIn = false;
			state.status = "idle";
			state.error = null;
			clearAuthToken(); // Clear the token from API
		},
		clearAuthError: (state) => {
			state.error = null;
		},
	},

	extraReducers: (builder) => {
		builder
			// Register User
			.addCase(registerUser.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.isLoggedIn = true;
				setAuthToken(action.payload.token); // Set token for future API calls
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload;
			})

			// Login User
			.addCase(loginUser.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.isLoggedIn = true;
				setAuthToken(action.payload.token); // Set token for future API calls
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload;
			})

			// Update User
			.addCase(updateUser.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(updateUser.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload;
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { logoutUser, clearAuthError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
