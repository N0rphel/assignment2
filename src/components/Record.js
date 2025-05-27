import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, Text, Alert } from "react-native";
import { Audio } from "expo-av";

export default function App() {
	const [recording, setRecording] = useState(null);
	const [recordedUri, setRecordedUri] = useState(null);
	const [sound, setSound] = useState(null);
	const [isRecording, setIsRecording] = useState(false);
	const [permissionResponse, setPermissionResponse] = useState(null);

	useEffect(() => {
		// Request permissions on component mount
		getPermissions();
	}, []);

	async function getPermissions() {
		try {
			console.log("Requesting permissions...");
			const permission = await Audio.requestPermissionsAsync();
			setPermissionResponse(permission);

			if (permission.status !== "granted") {
				Alert.alert(
					"Permission Required",
					"Permission to access microphone is required to record audio!"
				);
				return false;
			}

			console.log("Audio permission granted");
			return true;
		} catch (error) {
			console.error("Error getting permissions:", error);
			return false;
		}
	}

	async function configureAudioMode() {
		try {
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
				shouldDuckAndroid: true,
				playThroughEarpieceAndroid: false,
				staysActiveInBackground: false,
			});
			console.log("Audio mode configured for recording");
		} catch (error) {
			console.error("Error configuring audio mode:", error);
			throw error;
		}
	}

	async function startRecording() {
		try {
			// Check permissions first
			if (!permissionResponse || permissionResponse.status !== "granted") {
				const hasPermission = await getPermissions();
				if (!hasPermission) return;
			}

			// Stop any existing recording
			if (recording) {
				await recording.stopAndUnloadAsync();
				setRecording(null);
			}

			// Stop any playing sound
			if (sound) {
				await sound.unloadAsync();
				setSound(null);
			}

			console.log("Configuring audio mode...");
			await configureAudioMode();

			console.log("Starting recording...");
			const newRecording = new Audio.Recording();

			await newRecording.prepareToRecordAsync({
				...Audio.RecordingOptionsPresets.HIGH_QUALITY,
				android: {
					extension: ".wav",
					outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
					audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
					sampleRate: 44100,
					numberOfChannels: 1,
					bitRate: 128000,
				},
				ios: {
					extension: ".wav",
					audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
					sampleRate: 44100,
					numberOfChannels: 1,
					bitRate: 128000,
					linearPCMBitDepth: 16,
					linearPCMIsBigEndian: false,
					linearPCMIsFloat: false,
				},
			});

			await newRecording.startAsync();
			setRecording(newRecording);
			setIsRecording(true);
			console.log("Recording started successfully");
		} catch (err) {
			console.error("Failed to start recording:", err);
			Alert.alert(
				"Recording Error",
				`Failed to start recording: ${err.message}`
			);
			setIsRecording(false);
		}
	}

	async function stopRecording() {
		if (!recording) {
			console.log("No recording to stop");
			return;
		}

		try {
			console.log("Stopping recording...");
			setIsRecording(false);

			await recording.stopAndUnloadAsync();
			const uri = recording.getURI();

			if (uri) {
				setRecordedUri(uri);
				console.log("Recording stopped and stored at:", uri);
				Alert.alert("Success", "Recording saved successfully!");
			} else {
				console.error("No URI returned from recording");
				Alert.alert("Error", "Failed to save recording");
			}

			setRecording(null);

			// Reset audio mode for playback
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
				playsInSilentModeIOS: true,
			});
		} catch (error) {
			console.error("Error stopping recording:", error);
			Alert.alert("Error", `Failed to stop recording: ${error.message}`);
		}
	}

	async function playRecording() {
		if (!recordedUri) {
			Alert.alert("No Recording", "Please record audio first");
			return;
		}

		try {
			// Stop any existing sound
			if (sound) {
				await sound.unloadAsync();
				setSound(null);
			}

			console.log("Loading sound from:", recordedUri);

			const { sound: newSound } = await Audio.Sound.createAsync(
				{ uri: recordedUri },
				{
					shouldPlay: true,
					volume: 1.0,
				}
			);

			setSound(newSound);
			console.log("Playing sound...");

			// Set up playback status listener
			newSound.setOnPlaybackStatusUpdate((status) => {
				if (status.didJustFinish) {
					console.log("Playback finished");
				}
				if (status.error) {
					console.error("Playback error:", status.error);
				}
			});
		} catch (error) {
			console.error("Error playing recording:", error);
			Alert.alert(
				"Playback Error",
				`Failed to play recording: ${error.message}`
			);
		}
	}

	async function deleteRecording() {
		if (sound) {
			await sound.unloadAsync();
			setSound(null);
		}
		setRecordedUri(null);
		console.log("Recording deleted");
	}

	useEffect(() => {
		return () => {
			// Cleanup on unmount
			if (sound) {
				sound.unloadAsync();
			}
			if (recording) {
				recording.stopAndUnloadAsync();
			}
		};
	}, [sound, recording]);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>🎤 Audio Recorder</Text>

			<Text style={styles.status}>
				{permissionResponse?.status === "granted"
					? "✅ Microphone permission granted"
					: "❌ Microphone permission needed"}
			</Text>

			<View style={styles.buttonContainer}>
				<Button
					title={isRecording ? "🛑 Stop Recording" : "🎤 Start Recording"}
					onPress={isRecording ? stopRecording : startRecording}
					color={isRecording ? "#ff4444" : "#4CAF50"}
				/>
			</View>

			<View style={styles.buttonContainer}>
				<Button
					title="▶️ Play Recording"
					onPress={playRecording}
					disabled={!recordedUri}
				/>
			</View>

			<View style={styles.buttonContainer}>
				<Button
					title="🗑️ Delete Recording"
					onPress={deleteRecording}
					disabled={!recordedUri}
					color="#ff6666"
				/>
			</View>

			{recordedUri && (
				<Text style={styles.path}>
					✅ Recording saved to:{" "}
					{recordedUri.substring(recordedUri.lastIndexOf("/") + 1)}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 30,
		color: "#333",
	},
	status: {
		fontSize: 14,
		marginBottom: 20,
		textAlign: "center",
		color: "#666",
	},
	buttonContainer: {
		marginVertical: 10,
		width: "80%",
	},
	path: {
		marginTop: 20,
		fontSize: 12,
		color: "#555",
		textAlign: "center",
		paddingHorizontal: 20,
	},
});
