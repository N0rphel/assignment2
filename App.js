import React, { useState, useEffect } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useNavigation } from "@react-navigation/native";

import CategoryScreen from "./src/screens/CategoryScreen";
import DrugInCategoryScreen from "./src/screens/DrugInCategoryScreen";
import DrugDetailScreen from "./src/screens/DrugDetailScreen";
import LearningList from "./src/screens/LearningList";
import LearningScreen from "./src/screens/LearningScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import ProfileScreen from "./src/screens/Profile";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";

import { store, persistor } from "./src/redux/store";

const MainStack = createStackNavigator();
const Tabs = createBottomTabNavigator();
const DrugStack = createStackNavigator();
const LearningStack = createStackNavigator();
const AuthStack = createStackNavigator();

const ProtectedLearningTab = () => {
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
	const authStatus = useSelector((state) => state.auth.status);
	const navigation = useNavigation();
	const [alertShown, setAlertShown] = useState(false);

	useEffect(() => {
		if (authStatus !== "loading" && !isLoggedIn && !alertShown) {
			setAlertShown(true);
			Alert.alert("Not Logged In", "You must log in to view this tab.", [
				{ text: "OK", onPress: () => navigation.navigate("SignIn") },
			]);
		}
	}, [authStatus, isLoggedIn, alertShown, navigation]);

	if (authStatus === "loading" || !isLoggedIn) {
		return <ActivityIndicator />;
	}

	return <LearningStackScreens />;
};

function AuthStackScreens() {
	return (
		<AuthStack.Navigator screenOptions={{ headerShown: false }}>
			<AuthStack.Screen name="SignIn" component={SignInScreen} />
			<AuthStack.Screen name="SignUp" component={SignUpScreen} />
		</AuthStack.Navigator>
	);
}

function DrugStackScreens() {
	return (
		<DrugStack.Navigator initialRouteName="Categories">
			<DrugStack.Screen
				name="Categories"
				component={CategoryScreen}
				options={{ title: "Drugs", headerTitleAlign: "left" }}
			/>
			<DrugStack.Screen
				name="Drug List"
				component={DrugInCategoryScreen}
				options={{ headerTitle: "", headerBackTitle: "Drugs in Category" }}
			/>
			<DrugStack.Screen
				name="Drug Details"
				component={DrugDetailScreen}
				options={{ headerTitle: "", headerBackTitle: "Drug Details" }}
			/>
		</DrugStack.Navigator>
	);
}

function LearningStackScreens() {
	return (
		<LearningStack.Navigator>
			<LearningStack.Screen
				name="LearningList"
				component={LearningList}
				options={{ headerShown: false }}
			/>
			<LearningStack.Screen
				name="LearningScreen"
				component={LearningScreen}
				options={{ headerTitle: "", headerBackTitle: "Learning" }}
			/>
		</LearningStack.Navigator>
	);
}

function BottomTabs() {
	const currentCount = useSelector((state) => state.learning.current.length);

	return (
		<Tabs.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="Drugs"
				component={DrugStackScreens}
				options={{
					tabBarIcon: ({ size, color }) => (
						<Ionicons name="medkit" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="Learning"
				component={ProtectedLearningTab}
				options={{
					tabBarIcon: ({ size, color }) => (
						<Ionicons name="home" size={size} color={color} />
					),
					tabBarBadge: currentCount > 0 ? currentCount : null,
				}}
			/>
			<Tabs.Screen
				name="Community"
				component={CommunityScreen}
				options={{
					tabBarIcon: ({ size, color }) => (
						<Ionicons name="people" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="Profile"
				component={ProfileScreen}
				options={{
					tabBarIcon: ({ size, color }) => (
						<Ionicons name="person" size={size} color={color} />
					),
				}}
			/>
		</Tabs.Navigator>
	);
}

export default function App() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 3000);
		return () => clearTimeout(timer);
	}, []);

	if (isLoading) {
		return (
			<View style={styles.splashContainer}>
				<ActivityIndicator
					size="large"
					color="#4287f5"
					style={{ marginTop: 20 }}
				/>
				<Text style={styles.loadingText}>Loading Drug Speak...</Text>
			</View>
		);
	}

	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<NavigationContainer>
					<MainStack.Navigator screenOptions={{ headerShown: false }}>
						<MainStack.Screen name="Auth" component={AuthStackScreens} />
						<MainStack.Screen name="HomeTabs" component={BottomTabs} />
					</MainStack.Navigator>
				</NavigationContainer>
			</PersistGate>
		</Provider>
	);
}

const styles = StyleSheet.create({
	splashContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	loadingText: {
		marginTop: 20,
		alignContent: "center",
		fontSize: 16,
		color: "#666",
	},
});
