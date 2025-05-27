import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Alert,
} from "react-native";
import { Audio } from "expo-av";
import { useDispatch } from "react-redux";
import { finishDrug, removeDrug } from "../redux/learningSlice";
import PronunciationPlayer from "../components/PronunciationPlayer";
import { drugCategory } from "../../resources/resource";

export default function LearningScreen({ route, navigation }) {
	const { drug } = route.params;
	const [openIndex, setOpenIndex] = useState(null);
	const dispatch = useDispatch();

	const [recordings, setRecordings] = useState([]);
	const [recording, setRecording] = useState(null);

	const handleFinish = () => {
		dispatch(finishDrug(drug.id));
		navigation.goBack();
	};

	const handleRemove = () => {
		dispatch(removeDrug(drug.id));
		navigation.goBack();
	};

	const startRecording = async () => {
		try {
			const { status } = await Audio.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("Permission required", "Microphone permission is needed.");
				return;
			}

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
				shouldDuckAndroid: true,
				interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
				interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			});

			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY
			);
			setRecording(recording);
		} catch (err) {
			console.error("Failed to start recording", err);
			Alert.alert("Error", "Could not start recording.");
		}
	};

	const stopRecording = async () => {
		try {
			if (!recording) return;

			await recording.stopAndUnloadAsync();
			const uri = recording.getURI();
			setRecordings([...recordings, { uri, date: new Date(), score: null }]);
			setRecording(null);
		} catch (err) {
			console.error("Failed to stop recording", err);
			Alert.alert("Error", "Could not stop recording.");
		}
	};

	const evaluateRecording = (index) => {
		const updated = [...recordings];
		updated[index].score = Math.floor(Math.random() * 101);
		setRecordings(updated);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{drug.name}</Text>
			<Text style={styles.subtext}>({drug.molecular_formula})</Text>
			<Text style={styles.categories}>
				Categories:{" "}
				{drug.categories.map((id) => drugCategory[id]?.name || id).join(", ")}
			</Text>
			<Text style={styles.desc}>{drug.desc}</Text>

			<FlatList
				data={drug.sounds}
				keyExtractor={(item) => `${item.gender}-${item.file}`}
				renderItem={({ item, index }) => (
					<PronunciationPlayer
						label={drug.name}
						sound={item.file}
						gender={item.gender}
						isOpen={openIndex === index}
						onOpen={() => setOpenIndex(index)}
						onClose={() => setOpenIndex(null)}
					/>
				)}
			/>

			<View style={styles.recordContainer}>
				<TouchableOpacity
					style={styles.recordButton}
					onPressIn={startRecording}
					onPressOut={stopRecording}
				>
					<Text style={styles.recordText}>Hold to Record</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={recordings}
				keyExtractor={(item, index) => item.uri + index}
				renderItem={({ item, index }) => (
					<View style={styles.recordingItem}>
						<Text>Recording {index + 1}</Text>
						<TouchableOpacity
							style={styles.evalButton}
							onPress={() => evaluateRecording(index)}
						>
							<Text style={styles.evalText}>
								{item.score !== null ? `Score: ${item.score}` : "Evaluate"}
							</Text>
						</TouchableOpacity>
					</View>
				)}
			/>

			<View style={styles.buttonContainer}>
				<TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
					<Text style={styles.buttonText}>FINISH</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
					<Text style={styles.buttonText}>REMOVE</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
	},
	subtext: {
		marginTop: 15,
		textAlign: "center",
		fontSize: 13,
	},
	categories: {
		marginTop: 10,
		textAlign: "center",
	},
	desc: {
		marginTop: 10,
		fontSize: 15,
		textAlign: "justify",
	},
	recordContainer: {
		alignItems: "center",
		marginVertical: 20,
	},
	recordButton: {
		backgroundColor: "#e0564c",
		borderRadius: 100,
		width: 100,
		height: 100,
		justifyContent: "center",
		alignItems: "center",
	},
	recordText: {
		color: "white",
		fontWeight: "400",
		fontSize: 12,
	},
	recordingItem: {
		padding: 10,
		marginVertical: 5,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 6,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	evalButton: {
		backgroundColor: "#4287f5",
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 5,
	},
	evalText: {
		color: "white",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
	},
	finishButton: {
		backgroundColor: "#4287f5",
		paddingVertical: 12,
		paddingHorizontal: 25,
		borderRadius: 8,
	},
	removeButton: {
		backgroundColor: "#ff4444",
		paddingVertical: 12,
		paddingHorizontal: 25,
		borderRadius: 8,
	},
	buttonText: {
		color: "white",
		textAlign: "center",
		fontWeight: "bold",
	},
});
