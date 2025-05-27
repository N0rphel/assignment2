import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import audioFiles from "../../resources/audioMap";

export default function PronunciationPlayer({
	label,
	gender,
	isOpen,
	onOpen,
	onClose,
	speed,
	onSpeedChange,
}) {
	const [sound, setSound] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const genderIcon = gender === "male" ? "male" : "female";
	const genderColor = gender === "male" ? "#4287f5" : "#e0564c";

	// Configure audio mode on component mount
	useEffect(() => {
		const configureAudio = async () => {
			try {
				await Audio.setAudioModeAsync({
					allowsRecordingIOS: false,
					staysActiveInBackground: false,
					playsInSilentModeIOS: true,
					shouldDuckAndroid: true,
					playThroughEarpieceAndroid: false,
				});
			} catch (error) {
				console.error("Error configuring audio:", error);
			}
		};

		configureAudio();
	}, []);

	const playSound = async () => {
		if (isPlaying) {
			await stopSound();
			return;
		}

		setIsLoading(true);

		// Create the correct file key to match your audioFiles structure exactly
		const fileKey =
			gender === "male" ? `${label} 1 - male.wav` : `${label} - female.wav`;

		const audioSource = audioFiles[fileKey];

		console.log("Looking for audio file with label:", label, "gender:", gender);
		console.log("File key:", fileKey);
		console.log("Audio source found:", !!audioSource);

		if (!audioSource) {
			console.error("Audio file not found for key:", fileKey);
			console.log(
				"Available keys in audioFiles:",
				Object.keys(audioFiles).slice(0, 10)
			);
			setIsLoading(false);
			return;
		}

		try {
			// Stop any existing sound first
			if (sound) {
				await sound.unloadAsync();
				setSound(null);
			}

			const { sound: newSound } = await Audio.Sound.createAsync(audioSource, {
				shouldPlay: true,
				rate: speed,
				shouldCorrectPitch: true,
			});

			setSound(newSound);
			setIsPlaying(true);
			setIsLoading(false);

			newSound.setOnPlaybackStatusUpdate((status) => {
				if (status.didJustFinish) {
					setIsPlaying(false);
				}
				if (status.error) {
					console.error("Playback error:", status.error);
					setIsPlaying(false);
					setIsLoading(false);
				}
			});
		} catch (error) {
			console.error("Error playing sound:", error);
			setIsLoading(false);
			setIsPlaying(false);
		}
	};

	const stopSound = async () => {
		if (sound) {
			try {
				await sound.stopAsync();
				setIsPlaying(false);
			} catch (error) {
				console.error("Error stopping sound:", error);
			}
		}
	};

	// Update playback rate when speed changes
	useEffect(() => {
		if (sound && isPlaying) {
			sound.setRateAsync(speed, true).catch(console.error);
		}
	}, [speed, sound, isPlaying]);

	useEffect(() => {
		return () => {
			if (sound) {
				sound.unloadAsync().catch(console.error);
			}
		};
	}, [sound]);

	const speedOptions = [
		{ label: "0.25x", value: 0.25 },
		{ label: "0.33x", value: 0.33 },
		{ label: "0.75x", value: 0.75 },
		{ label: "1.0x", value: 1.0 },
	];

	return (
		<View style={styles.container}>
			{/* Play/Pause Button */}
			<TouchableOpacity onPress={playSound} style={styles.playButton}>
				{isLoading ? (
					<ActivityIndicator size="small" color="#666" />
				) : (
					<Ionicons
						name={isPlaying ? "pause" : "play"}
						size={24}
						color="#4287f5"
					/>
				)}
			</TouchableOpacity>

			{/* Drug Name Label */}
			<Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
				{label}
			</Text>

			{/* Gender Icon */}
			<Ionicons
				name={genderIcon}
				size={20}
				color={genderColor}
				style={styles.genderIcon}
			/>

			{/* Speed Selector */}
			{isOpen ? (
				<View style={styles.pickerContainer}>
					<Picker
						selectedValue={speed}
						style={styles.picker}
						onValueChange={(itemValue) => {
							onSpeedChange(itemValue);
						}}
					>
						{speedOptions.map((option) => (
							<Picker.Item
								key={option.value}
								label={option.label}
								value={option.value}
							/>
						))}
					</Picker>
				</View>
			) : (
				<TouchableOpacity onPress={onOpen} style={styles.speedButton}>
					<Text style={styles.speedText}>{speed}x</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		marginVertical: 6,
		backgroundColor: "#fff",
		borderRadius: 8,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	playButton: {
		padding: 8,
		marginRight: 10,
	},
	label: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
	},
	genderIcon: {
		marginHorizontal: 12,
	},
	pickerContainer: {
		width: 100,
		height: 40,
		justifyContent: "center",
	},
	picker: {
		width: "100%",
		height: "100%",
	},
	speedButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: "#f0f0f0",
		borderRadius: 4,
	},
	speedText: {
		fontSize: 14,
		color: "#333",
	},
});
