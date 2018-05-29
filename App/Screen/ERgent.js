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
    createStackNavigator,
  } from 'react-navigation';

import Home from './Home'
import HospitalList from './HospitalList'
import SymtomsList from './SymtomsList'
import TermsConditions from './TermsConditions'
import ShortestWaitTimeList from './ShortestWaitTimeList'
import SearchByLocation from './SearchByLocation'
import DirectionScreen from './DirectionScreen'
import MapViewListScreen from './MapViewListScreen'
import ws from './GeneralClass/webservice'

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
        ws.initNetInfoForConnectivity()
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
  return createStackNavigator(
    {        
        home: {screen: Home, path: 'main'},
        termsConditions: {screen: TermsConditions},
        hospitalList: {screen: HospitalList},
        symtomsList: {screen: SymtomsList},
        shortestWaitTimeList: {screen: ShortestWaitTimeList},
        searchByLocation: {screen: SearchByLocation},
        directionScreen: {screen: DirectionScreen},
        mapViewListScreen: {screen: MapViewListScreen}
    },
    {
      headerMode: "none",
      mode: "card",
      initialRouteName: "home"
    }
  );
};