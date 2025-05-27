import React, {useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useSelector } from "react-redux";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";

export default function LearningList() {
    const navigation = useNavigation();
    const currentLearning = useSelector(state=> state.learning.current);
    const finishedLearning = useSelector(state => state.learning.finished);

    const[showCurrent, setShowCurrent] = useState(false);
    const[showFinished, setShowFinished] = useState(false);

    const toggleCurrent = () => setShowCurrent(!showCurrent);
    const toggleFinished = () => setShowFinished(!showFinished);

    const renderDrug =({item}) => (
        <TouchableOpacity
        onPress={() => navigation.navigate('LearningScreen', { drug: item })}
        style={styles.drugItem}>
            <Text>{item.name}</Text>
        </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    {/* Current Learning */}
    <Text style={styles.title}>Learning List</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.header} onPress={toggleCurrent}>
          <Text style={styles.headerText}>
           Current Learning ({currentLearning.length})
          </Text>
          <Ionicons
            name={showCurrent ? 'remove' : 'add'}
            size={20}
            color="black"
          />
        </TouchableOpacity>

        {showCurrent && (
          <FlatList
            data={currentLearning}
            keyExtractor={(item) => item.id}
            renderItem={renderDrug}
          />
        )}
      </View>

      {/* Finished Learning */}
        <TouchableOpacity style={styles.header} onPress={toggleFinished}>
          <Text style={styles.headerText}>
           Finished ({finishedLearning.length})
          </Text>
          <Ionicons
            name={showFinished ? 'remove' : 'add'}
            size={20}
            color="black"
          />
        </TouchableOpacity>

        {showFinished && (
          <FlatList
            data={finishedLearning}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.drugItem}>
                <Text>{item.name}</Text>
              </View>
            )}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title:{
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 30,
    marginBottom: 10,
  },
  header: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f2f2f2',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  drugItem: {
    padding: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
    marginVertical:1,
  },
});