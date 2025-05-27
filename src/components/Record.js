import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { Audio } from "expo-av";

export default function App() {
	const [recording, setRecording] = useState(null);
	const [recordedUri, setRecordedUri] = useState(null);
	const [sound, setSound] = useState(null);
	const [isRecording, setIsRecording] = useState(false);

	useEffect(() => {
		// Ask for audio recording permissions
		(async () => {
			const { status } = await Audio.requestPermissionsAsync();
			if (status !== "granted") {
				alert("Permission to access microphone is required!");
			}
		})();
	}, []);

	async function startRecording() {
		try {
			console.log("Requesting permissions...");
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			console.log("Starting recording...");
			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY
			);

			setRecording(recording);
			setIsRecording(true);
			console.log("Recording started");
		} catch (err) {
			console.error("Failed to start recording", err);
		}
	}

	async function stopRecording() {
		console.log("Stopping recording...");
		setRecording(undefined);
		setIsRecording(false);
		await recording.stopAndUnloadAsync();
		const uri = recording.getURI();
		setRecordedUri(uri);
		console.log("Recording stopped and stored at:", uri);
	}

	async function playRecording() {
		if (!recordedUri) return;

		console.log("Loading sound from:", recordedUri);
		const { sound } = await Audio.Sound.createAsync(
			{ uri: recordedUri },
			{ shouldPlay: true }
		);
		setSound(sound);
		console.log("Playing sound...");
		await sound.playAsync();
	}

	useEffect(() => {
		return sound
			? () => {
					console.log("Unloading sound");
					sound.unloadAsync();
			  }
			: undefined;
	}, [sound]);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>🎤 Audio Recorder</Text>
			<Button
				title={isRecording ? "Stop Recording" : "Start Recording"}
				onPress={isRecording ? stopRecording : startRecording}
			/>
			<View style={{ marginTop: 20 }}>
				<Button
					title="Play Recording"
					onPress={playRecording}
					disabled={!recordedUri}
				/>
			</View>
			{recordedUri && <Text style={styles.path}>Saved to: {recordedUri}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 100,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	title: {
		fontSize: 20,
		marginBottom: 20,
	},
	path: {
		marginTop: 10,
		fontSize: 12,
		color: "#555",
		textAlign: "center",
	},
});
