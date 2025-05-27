import React from 'react';
import { Text, View, FlatList, StyleSheet} from 'react-native';
import DrugItem from '../components/DrugItem';
import {drugData} from '../../resources/resource';
import { useSelector } from 'react-redux';

export default function DrugInCategoryScreen({ route, navigation }) {

  const { category} = route.params;

  const learningList = useSelector(state => state.learning.current);
  
  const drugs = drugData.filter(drug => drug.categories.includes(category.id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.name}</Text>
      <FlatList
        data={drugs}
        keyExtractor={(item) =>item.id.toString()}
        renderItem={({item})=>{
          const isLearning = learningList.some(d => d.id === item.id);
          return (
            <DrugItem
              name={item.name}
              onPress={() => navigation.navigate('Drug Details', {drug: item})}
              isLearning={isLearning}
            />
          );
        }}
      />   
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    padding: 10,
  },
  title:{
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
