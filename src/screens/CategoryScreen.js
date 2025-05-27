import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import CategoryItem from '../components/CategoryItem';
import { drugData, drugCategory } from '../../resources/resource';

const extractCategories = () => {
  const categories = {};

  drugData.forEach(drug => {
    drug.categories.forEach(catId => {
      if (drugCategory[catId]) {
        if (categories[catId]) {
          categories[catId].count++;
        } else {
          categories[catId] = {
            id: catId,
            name: drugCategory[catId].name,
            count: 1
          };
        }
      }
    });
  });

  return Object.values(categories);
};


export default function CategoryScreen({navigation}){
  const categories = extractCategories();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <FlatList
        data = {categories}
        keyExtractor={(item)=> item.id}
        renderItem={({item})=> (
          <CategoryItem
            name={item.name}
            count={item.count}
            onPress={()=> navigation.navigate('Drug List', {category: item})}
          />
        )}
      />
    </View>
  );
}

const styles =StyleSheet.create({
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
