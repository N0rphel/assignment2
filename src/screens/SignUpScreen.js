import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	Alert,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { useDispatch } from "react-redux";
import { registerUser } from "../redux/authSlice";

export default function SignUpScreen({ navigation }) {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [gender, setGender] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const dispatch = useDispatch();

	const validateForm = () => {
		// Username validation
		if (!username.trim()) {
			Alert.alert("Error", "Username should not be empty");
			return false;
		}

		// Email validation
		if (!email.trim()) {
			Alert.alert("Error", "Email should not be empty");
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			Alert.alert("Error", "Please enter a valid email address");
			return false;
		}

		// Password validation
		if (!password) {
			Alert.alert("Error", "Password should not be empty");
			return false;
		}

		if (password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return false;
		}

		// Gender validation
		if (!gender) {
			Alert.alert("Error", "Please select a gender");
			return false;
		}

		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		try {
			const userData = {
				username: username.trim(),
				email: email.trim().toLowerCase(),
				password,
				gender,
			};

			console.log("Submitting registration:", userData);
			await dispatch(registerUser(userData)).unwrap();

			Alert.alert("Success", "Registration successful!", [
				{
					text: "OK",
					onPress: () => navigation.navigate("Auth", { screen: "Profile" }),
				},
			]);
		} catch (error) {
			console.log("Registration error:", error);
			Alert.alert(
				"Registration Failed",
				error.message || "Registration failed. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClear = () => {
		setUsername("");
		setEmail("");
		setPassword("");
		setGender("");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sign Up a New User</Text>

			<Text style={styles.label}>User Name</Text>
			<TextInput
				style={styles.input}
				value={username}
				onChangeText={setUsername}
				placeholder="Enter your username"
				autoCapitalize="none"
				autoCorrect={false}
			/>

			<View style={styles.genderContainer}>
				<Text style={styles.label}>Gender</Text>
				<View style={styles.genderOptions}>
					<TouchableOpacity
						style={[
							styles.genderButton,
							gender === "male" && styles.selectedGender,
						]}
						onPress={() => setGender("male")}
					>
						<Text
							style={
								gender === "male"
									? styles.selectedGenderText
									: styles.genderText
							}
						>
							Male
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.genderButton,
							gender === "female" && styles.selectedGender,
						]}
						onPress={() => setGender("female")}
					>
						<Text
							style={
								gender === "female"
									? styles.selectedGenderText
									: styles.genderText
							}
						>
							Female
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			<Text style={styles.label}>Email</Text>
			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				placeholder="Enter your email"
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
			/>

			<Text style={styles.label}>Password</Text>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				placeholder="Enter your password"
				secureTextEntry
			/>

			<View style={styles.buttonContainer}>
				<Button title="Clear" onPress={handleClear} color="#888" />
				<Button
					title={isLoading ? "Loading..." : "Sign Up"}
					onPress={handleSubmit}
					disabled={isLoading}
				/>
			</View>

			<TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
				<Text style={styles.switchText}>
					Already have an account? Sign in here
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 30,
		textAlign: "center",
		color: "#333",
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 5,
		color: "#333",
	},
	input: {
		height: 45,
		borderColor: "#ddd",
		borderWidth: 1,
		marginBottom: 15,
		paddingHorizontal: 15,
		borderRadius: 8,
		backgroundColor: "#f9f9f9",
	},
	genderContainer: {
		marginBottom: 15,
	},
	genderOptions: {
		flexDirection: "row",
		gap: 10,
	},
	genderButton: {
		flex: 1,
		padding: 12,
		borderWidth: 1,
		borderColor: "#ddd",
		alignItems: "center",
		borderRadius: 8,
		backgroundColor: "#f9f9f9",
	},
	selectedGender: {
		backgroundColor: "#007AFF",
		borderColor: "#007AFF",
	},
	genderText: {
		color: "#333",
		fontWeight: "500",
	},
	selectedGenderText: {
		color: "#fff",
		fontWeight: "500",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
		gap: 15,
	},
	switchText: {
		color: "#007AFF",
		textAlign: "center",
		marginTop: 15,
		fontSize: 16,
	},
});
