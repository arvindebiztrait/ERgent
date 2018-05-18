import React, { Component } from 'react'

import {
   StyleSheet,
   Text,
   Navigator,
   StatusBar,
   AsyncStorage,
   TouchableOpacity,
   AppRegistry,
   StackRouter,
   Dimensions,
   Platform,
   TouchableHighlight,
   Image,
   View,
   Linking
} from 'react-native'

import {
    StackNavigator,
  } from 'react-navigation';

import Home from './Home'
import HospitalList from './HospitalList'
import SymtomsList from './SymtomsList'
import TermsConditions from './TermsConditions'
import ShortestWaitTimeList from './ShortestWaitTimeList'
import SearchByLocation from './SearchByLocation'

export default class ERgent extends Component {
    constructor(props){
       super(props)
        console.log("inside the constructor")
        this.state = {
           isLogin:0,
           userType:1,
           token:'',
       };
    //    ws.initNetInfoForConnectivity()
     }

     componentDidMount() {

     }

     render() {
        console.log("signed inside render",this.state.isLogin)
        
        const Layout = createRootNavigator(this.state.isLogin,this.state.userType);
        return(

           <Layout />
        );
   }
}

//Creating the Navigation 
export const createRootNavigator = (signedIn,userType) => {
  console.log("signed in is",signedIn,userType)
  return StackNavigator(
    {        
        home: {screen: Home, path: 'main'},
        termsConditions: {screen: TermsConditions},
        hospitalList: {screen: HospitalList},
        symtomsList: {screen: SymtomsList},
        shortestWaitTimeList: {screen: ShortestWaitTimeList},
        searchByLocation: {screen: SearchByLocation}
    },
    {
      headerMode: "none",
      mode: "card",
      initialRouteName: "home"
    }
  );
};