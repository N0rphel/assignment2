import React, {useState} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import PronunciationPlayer from '../components/PronunciationPlayer';
import { drugCategory } from '../../resources/resource';
import { useDispatch, useSelector } from 'react-redux';
import { addToLearning } from '../redux/learningSlice';
import { Audio } from 'expo-av';

export default function DrugDetailScreen({ route, navigation }) {
  const { drug } = route.params;
  const [openIndex, setOpenIndex] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [speedItems, setSpeedItems] = useState([
    {label: '0.25x', value: 0.25},
    {label: '0.33x', value: 0.33},
    {label: '0.75x', value: 0.75},
    {label: '1.0x', value: 1.0}
  ]);

  const dispatch = useDispatch();
  const learningList = useSelector(state => state.learning.current);
  const isLearning = learningList.some(d => d.id === drug.id);

  const playAudio = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.setRateAsync(playbackSpeed);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>{drug.name}</Text>
        <Text style={styles.subtext}>({drug.molecular_formula})</Text>
        <Text style={styles.categories}>
          Categories: {drug.categories.map(id => drugCategory[id]?.name || id).join(', ')}
        </Text>
        <Text style={styles.desc}>{drug.desc}</Text>

        <View style={styles.speedContainer}>
          <DropDownPicker
            open={speedOpen}
            value={playbackSpeed}
            items={speedItems}
            setOpen={setSpeedOpen}
            setValue={setPlaybackSpeed}
            setItems={setSpeedItems}
            placeholder="Select speed"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            labelStyle={styles.dropdownLabel}
          />
        </View>

        <FlatList
          data={drug.sounds}
          keyExtractor={(item) => `${item.gender}-${item.file}`}
          renderItem={({ item, index }) => (
            <PronunciationPlayer 
              label={drug.name} 
              sound={item.file} 
              gender={item.gender} 
              speed={playbackSpeed}
              isOpen={openIndex === index}
              onOpen={() => setOpenIndex(index)}
              onClose={() => setOpenIndex(null)}
              onPlay={playAudio}
          />
        )}
      />
        {!isLearning && (
          <TouchableOpacity 
              style={styles.studyButton}
              onPress={() => {
                dispatch(addToLearning(drug));
                Alert.alert('Added to Learning List', `${drug.name} has been added to your study list`);
              }}
          >
          <Text style={styles.studyText}>STUDY</Text>
        </TouchableOpacity>
        )}
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
  },
  subtext: { 
    marginTop: 15,
    textAlign: 'center', 
    fontSize: 13, 
  },
  categories: { 
    marginTop: 10, 
    textAlign: 'center', 
  },
  desc: { 
    marginTop: 10, 
    fontSize: 15, 
    textAlign: 'justify',
  },
  studyButton: {
    backgroundColor: '#4287f5', 
    padding: 15, 
    marginTop: 20, 
    borderRadius: 7,
  },
  studyText: { 
    color: 'white', 
    textAlign: 'center', 
    fontWeight: 'bold',
  },
    speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
    zIndex: 3000,
  },
  dropdown: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
  },
  dropdownContainer: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownLabel: {
    fontWeight: 'bold',
  },
});
