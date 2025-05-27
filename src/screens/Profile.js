import React, { useState } from "react";
import {
	View,
	Text,
	Button,
	Modal,
	TextInput,
	Alert,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { updateUserProfile } from "../API/drugSpeakAPI";

export default function ProfileScreen({ navigation }) {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	const learningState = useSelector((state) => state.learning); // Get learning stats

	const [isUpdating, setIsUpdating] = useState(false);
	const [showUpdateForm, setShowUpdateForm] = useState(false);
	const [formData, setFormData] = useState({
		username: user?.username || "",
		password: "",
		gender: user?.gender || "",
	});

	const handleUpdate = async () => {
		if (!formData.username.trim()) {
			Alert.alert("Error", "Username cannot be empty");
			return;
		}

		if (formData.password && formData.password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return;
		}

		setIsUpdating(true);
		try {
			await updateUserProfile(user._id, {
				username: formData.username,
				...(formData.password && { password: formData.password }),
				gender: formData.gender,
			});
			Alert.alert("Success", "Profile updated!");
			setShowUpdateForm(false);
		} catch (error) {
			Alert.alert("Error", error.message || "Update failed");
		} finally {
			setIsUpdating(false);
		}
	};

	// Handle sign-out
	const handleSignOut = () => {
		dispatch(logoutUser());
		navigation.navigate("HomeTabs", {
			screen: "Profile",
		});
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>User Profile</Text>
			<Text>User Name: {user?.username}</Text>
			<Text>Email: {user?.email}</Text>
			<Text>Gender: {user?.gender}</Text>
			<Text>Current Learning: {learningState?.current?.length || 0}</Text>
			<Text>Finished: {learningState?.finished?.length || 0}</Text>
			<Text>Total Score: {learningState?.totalScore || 0}</Text>

			{/* Update Button */}
			<Button title="Update" onPress={() => setShowUpdateForm(true)} />

			{/* Update Profile Modal */}
			<Modal visible={showUpdateForm} animationType="slide">
				<View style={styles.modalContainer}>
					<Text style={styles.modalTitle}>User Profile</Text>
					<Text style={styles.label}>New User Name</Text>
					<TextInput
						value={formData.username}
						onChangeText={(text) =>
							setFormData({ ...formData, username: text })
						}
						style={styles.input}
					/>
					<Text style={styles.label}>New Password</Text>
					<TextInput
						value={formData.password}
						onChangeText={(text) =>
							setFormData({ ...formData, password: text })
						}
						secureTextEntry
						style={styles.input}
					/>
					<View style={styles.buttonRow}>
						<Button
							title="Cancel"
							onPress={() => setShowUpdateForm(false)}
							disabled={isUpdating}
						/>
						<Button
							title={isUpdating ? "Updating..." : "Confirm"}
							onPress={handleUpdate}
							disabled={isUpdating}
						/>
					</View>
				</View>
			</Modal>

			{/* Sign Out Button */}
			<Button title="Sign Out" onPress={handleSignOut} color="red" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
	},
	label: {
		marginRight: 10,
		fontSize: 16,
	},
});
