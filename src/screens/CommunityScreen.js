import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	ActivityIndicator,
	StyleSheet,
	Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { getRankings } from "../API/drugSpeakAPI";
import { useNavigation } from "@react-navigation/native";

export default function CommunityScreen() {
	const [rankings, setRankings] = useState([]);
	const [loading, setLoading] = useState(true);
	const currentUserId = useSelector((state) => state.auth.user?.id);
	const navigation = useNavigation();

	const fetchRankings = async () => {
		try {
			setLoading(true);

			// Simulate 2-second delay as required
			await new Promise((resolve) => setTimeout(resolve, 2000));

			const data = await getRankings();
			setRankings(data.sort((a, b) => b.score - a.score));
		} catch (error) {
			console.error("Error fetching rankings:", error);
			Alert.alert("Error", "Failed to fetch rankings");
		} finally {
			setLoading(false);
		}
	};

	// Fetch rankings on component mount and when screen comes into focus
	useEffect(() => {
		const unsubscribe = navigation.addListener("focus", () => {
			fetchRankings();
		});

		// Initial fetch
		fetchRankings();

		return unsubscribe;
	}, [navigation]);

	const renderItem = ({ item, index }) => (
		<View
			style={[styles.item, item.id === currentUserId && styles.highlightedItem]}
		>
			<Text style={styles.rankText}>
				{index + 1}. {item.name} (Score: {item.score})
			</Text>
			<Text style={styles.statsText}>
				Learning: {item.learningCount} | Finished: {item.finishedCount}
			</Text>
		</View>
	);

	const renderEmptyComponent = () => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>No rankings available</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Community Rankings</Text>
			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#4287f5" />
					<Text style={styles.loadingText}>Loading rankings...</Text>
				</View>
			) : (
				<FlatList
					data={rankings}
					renderItem={renderItem}
					keyExtractor={(item) => item.id.toString()}
					ListEmptyComponent={renderEmptyComponent}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#fff",
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
		textAlign: "center",
		color: "#333",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: "#666",
	},
	item: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
		backgroundColor: "#fff",
	},
	highlightedItem: {
		backgroundColor: "#e6f7ff",
		borderLeftWidth: 4,
		borderLeftColor: "#4287f5",
	},
	rankText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	statsText: {
		fontSize: 14,
		color: "#666",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 50,
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
	},
});
