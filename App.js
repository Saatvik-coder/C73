import React,{Component} from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'
import statusScreen from './screens/statusScreen'
import searchScreen from './screens/searchScreen'

export default class App extends Component{
render(){
  return (
<AppContainer/>
  );
}}

const TabNavigator = createBottomTabNavigator({
  Transaction:{screen:statusScreen},
  Search:{screen:searchScreen},
},
{defaultNavigationOptions:({navigation})=>({
  tabBarIcon:()=>{
    const routeName=navigation.state.routeName
    if(routeName==='Transaction'){
      return(
        <Image source={require('./assets/book.png')}
        style={{width:40,height:40}}/>
      )
    }

      else if(routeName==='Search'){
      return(
        <Image source={require('./assets/searchingbook.png')}
          style={{width:40,height:40}}/>
      )
    }
  }
})
}
)
const AppContainer = createAppContainer(TabNavigator)