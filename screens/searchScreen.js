import React,{Component} from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default class searchScreen extends Component{
render(){
  return (
    <View style={styles.container}>
      <Text >
Search
      </Text>
     

    </View>
  );
}}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  
    backgroundColor: '#ecf0f1',
    padding: 8,
  },

});
