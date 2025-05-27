import axios from "axios";

// Create axios instance with default config
const api = axios.create({
	baseURL: "http://10.2.23.137:3000/", // Added /api/ to match your backend
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Token management without Redux dependency to avoid circular imports
let authToken = null;

export const setAuthToken = (token) => {
	authToken = token;
};

export const clearAuthToken = () => {
	authToken = null;
};

api.interceptors.request.use(
	(config) => {
		if (authToken) {
			config.headers.Authorization = `Bearer ${authToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

/**
 * Wrapper for API requests with standardized error handling
 */
const request = async (method, endpoint, data = null, customHeaders = {}) => {
	try {
		const response = await api({
			method,
			url: endpoint,
			data,
			headers: { ...customHeaders },
		});
		return response.data;
	} catch (error) {
		const errorData = error.response?.data || {
			message: error.message || "Network error occurred",
			status: 500,
		};

		console.error(`API Error [${method} ${endpoint}]:`, errorData);
		throw {
			message: errorData.message || "Request failed",
			status: error.response?.status || 500,
			data: errorData.errors,
		};
	}
};

// ================= Authentication =================
export const authAPI = {
	signUp: (userData) =>
		request("POST", "/users", {
			username: userData.username.trim(), // Trim whitespace
			email: userData.email.trim().toLowerCase(),
			password: userData.password,
			gender: userData.gender || "unspecified",
		}),

	signIn: (credentials) =>
		request("POST", "/auth/login", {
			email: credentials.email.trim().toLowerCase(),
			password: credentials.password,
		}),

	updateUserProfile: (userId, updates) =>
		request("PATCH", `/users/${userId}`, updates),

	verifyToken: () => request("GET", "/auth/verify"),
};

// ================= Drug Resources =================
export const drugAPI = {
	getCategories: () => request("GET", "/drugs/categories"),
	getDrugsByCategory: (categoryId) =>
		request("GET", `/drugs/category/${categoryId}`),
	getDrugDetails: (drugId) => request("GET", `/drugs/${drugId}`),
	searchDrugs: (query) => request("GET", `/drugs/search?q=${query}`),
};

// ================= Learning System =================
export const learningAPI = {
	addToLearningList: (drugId) => request("POST", "/learning", { drugId }),
	getLearningLists: () => request("GET", "/learning"),
	markAsLearned: (learningId) =>
		request("PATCH", `/learning/${learningId}/complete`),
	removeFromList: (learningId) => request("DELETE", `/learning/${learningId}`),
	getProgress: () => request("GET", "/learning/progress"),
};

// ================= Community & Rankings =================
export const communityAPI = {
	getLeaderboard: () => request("GET", "/community/leaderboard"),
	getUserRank: (userId) => request("GET", `/community/rank/${userId}`),
	getRecentActivity: () => request("GET", "/community/activity"),
};

// ================= Audio & Evaluation =================
export const evaluationAPI = {
	submitRecording: async (drugId, audioUri) => {
		const formData = new FormData();
		formData.append("audio", {
			uri: audioUri,
			type: "audio/m4a",
			name: `recording_${Date.now()}.m4a`,
		});
		formData.append("drugId", drugId);

		return request("POST", "/evaluation", formData, {
			"Content-Type": "multipart/form-data",
		});
	},

	getPronunciationTips: (drugId) =>
		request("GET", `/evaluation/tips/${drugId}`),
	getEvaluationHistory: () => request("GET", "/evaluation/history"),
};

// ================= User Management =================
export const userAPI = {
	getUserProfile: (userId) => request("GET", `/users/${userId}`),
	updateAvatar: (userId, imageUri) => {
		const formData = new FormData();
		formData.append("avatar", {
			uri: imageUri,
			type: "image/jpeg",
			name: `avatar_${userId}.jpg`,
		});

		return request("PATCH", `/users/${userId}/avatar`, formData, {
			"Content-Type": "multipart/form-data",
		});
	},
};
