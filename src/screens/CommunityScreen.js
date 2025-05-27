import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	ActivityIndicator,
	StyleSheet,
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
			Alert.alert("Error", "Failed to fetch rankings");
		} finally {
			setLoading(false);
		}
	};

	// Refresh on focus and initial load
	useEffect(() => {
		const unsubscribe = navigation.addListener("focus", fetchRankings);
		fetchRankings();
		return unsubscribe;
	}, [navigation]);

	useEffect(() => {
		setTimeout(() => fetchRankings(), 2000);
		const fetchRankings = async () => {
			try {
				const data = await getRankings();
				setRankings(data);
			} catch (error) {
				Alert.alert("Error", "Failed to fetch rankings");
			} finally {
				setLoading(false);
			}
		};
		fetchRankings();
	}, []);

	const renderItem = ({ item, index }) => (
		<View
			style={[styles.item, item.id === currentUserId && styles.highlightedItem]}
		>
			<Text>
				{index + 1}. {item.name} (Score: {item.score})
			</Text>
			<Text>
				Learning: {item.learningCount} | Finished: {item.finishedCount}
			</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			{loading ? (
				<ActivityIndicator size="large" />
			) : (
				<FlatList
					data={rankings}
					renderItem={renderItem}
					keyExtractor={(item) => item.id.toString()}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	item: {
		padding: 10,
		borderBottomWidth: 1,
	},
	highlightedItem: {
		backgroundColor: "#e6f7ff",
	},
});
