//const extractCategories = () => {
//   const categories = {};

//   Object.values(resources).forEach(drug => {
//     drug.categories.forEach(cat => {
//       categories[cat] = (categories[cat] || 0) + 1;
//     });
//   });

//   return Object.entries(categories).map(([name, count]) => ({name, count}));
// };

// export default function CategoryScreen({navigation}){
//   const categories = extractCategories();

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Categories</Text>
//       <FlatList
//         data = {categories}
//         keyExtractor={(item)=> item.name}
//         renderItem={({item})=> (
//           <CategoryItem
//             name={item.name}
//             count={item.count}
//             onPress={()=> navigation.navigate('DrugList', {categoriesName: item.name})}
//           />
//         )}
//       />
//     </View>
//   );
// }

// const styles =StyleSheet.create({
//   container:{
//     flex: 1,
//     padding: 10,
//   },
//   title:{
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
// });