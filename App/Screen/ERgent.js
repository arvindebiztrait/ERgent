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
   Linking,
   TouchableWithoutFeedback,
   NetInfo,
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
import SearchByLocationDirection from './SearchByLocationDirection'
import ws from './GeneralClass/webservice'
import Constant from './GeneralClass/Constant'
import Events from 'react-native-simple-events';
import DeviceInfo from 'react-native-device-info';

var timerVar;

export default class ERgent extends Component {
    constructor(props){
       super(props)
        console.log("inside the constructor")
        this.state = {
           isLogin:0,
           userType:1,
           token:'',
           isVisibleAdvertise:false,
           arrAdvertisements:[],
           advertiseIndex:0,
           currentAdvertimementData: {},
           PageNumber:1,
           PageSize: 100,
       };
    //    ws.initNetInfoForConnectivity()
     }

     componentDidMount() {
        ws.initNetInfoForConnectivity()
        // Events.on('receiveResponse', 'receiveERgent', this.onReceiveResponse.bind(this)) 

        // var that = this

        // clearTimeout(timerVar)

        // timerVar = setTimeout(()=>{
        //   that.getAdvertisementList()
        // }, 5000);
     }

     onReceiveResponse (responceData) { 
       
        if (responceData.MethodName == 'getAdvertisementList') {
          console.log('responceData:=',responceData)
            
            if (responceData.Status == true) {                    
                let advertiseList = responceData.Results.SymptomsData;
                
                // this.setState({
                //     arrAdvertisements : advertiseList,
                // })
                this.state.arrAdvertisements = advertiseList
                this.startCounterForAdvertisement()
            }
            else {
                this.setState({
                    isLoading:false
                })
                alert(responceData.ErrorMessage)
            }
        }    
        else if (responceData.MethodName == 'AdvertisementClick') {
            console.log("responceData:=",responceData)
        }
    }

    startCounterForAdvertisement() {
      var that = this
      timerVar = setTimeout(()=>{
        that.loadAdvertisements()
      }, 5000);
    }

    loadAdvertisements() {
      if (this.state.advertiseIndex < this.state.arrAdvertisements.length) {
        var adData = this.state.arrAdvertisements[this.state.advertiseIndex]
        this.setState({
          advertiseIndex : this.state.advertiseIndex + 1,
          currentAdvertimementData : adData,
          isVisibleAdvertise: true
        })
      }
    }

     render() {
        console.log("signed inside render",this.state.isLogin)

        // var strURL = ""
        // if (this.state.currentAdvertimementData.ImagePath) {
        //   strURL = this.state.currentAdvertimementData.ImagePath
        // }
        // console.log("strURL:=",strURL)
        
        const Layout = createRootNavigator(this.state.isLogin,this.state.userType);
        return(
          <View style={{
            flex:1
          }}>
           <Layout />
           {/* {this.state.isVisibleAdvertise === true ? 
            <View style={{
              flex:1,
              backgroundColor:'rgba(0,0,0,0.4)',
              position:'absolute',
              zIndex:1,
              marginTop:0,
              marginLeft:0,
              height:'100%',
              width:'100%',
            }}>
             <View style={{
               height:350,
               width:Constant.DEVICE_WIDTH - 40,
               backgroundColor:'white',
               marginLeft:20,
               //  marginTop:'',
               position:'absolute',
               zIndex:2,
               marginTop:(Constant.DEVICE_HEIGHT - 350)/2,
               shadowColor:'gray',
               shadowOpacity:1.0,
               shadowOffset:{ width: 0, height: 2 },
               elevation:5,
               borderRadius:5,
               overflow:'hidden',
             }}>

                <Image
                    style={{
                        height:'100%',
                        width:'100%',
                    }}
                    source={{ uri: strURL}}
                    resizeMode={'center'}
                ></Image>

                <TouchableWithoutFeedback onPress={this.hideAdvertiseMent.bind(this)}>
                    <Image
                        style={{
                            height:40,
                            width:40,
                            // backgroundColor:'red',
                            marginTop: Platform.OS === 'ios' ? 10 : 10,
                            marginLeft: Constant.DEVICE_WIDTH - 90,
                            // marginLeft: 5,
                            position: 'absolute',
                            // borderRadius:20,
                            shadowColor:'gray',
                            shadowOpacity:1.0,
                            shadowOffset:{ width: 0, height: 2 },
                            elevation:5,
                        }}
                        source={require('../Images/close_red.png')}
                        resizeMode={'contain'}
                    ></Image>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback onPress={this.viewAdvertisement.bind(this)}>
                    <Text style={{
                      height:30,
                      width: 150,
                      position: 'absolute',
                      padding:5,
                      backgroundColor:'rgba(227,54,74,1)',
                      textAlign:'center',
                      marginTop: 310,
                      marginLeft: (Constant.DEVICE_WIDTH - 190) /2,
                      color: 'white',
                      textAlignVertical: 'center',
                      borderRadius:4,
                      overflow:'hidden',
                      fontFamily:"Lato-Semibold"
                    }}>View Advertise</Text>
                </TouchableWithoutFeedback>
             </View>
            </View>
          :
            undefined
          } */}
           </View>
        );
   }

   viewAdvertisement() {
      this.setState({
        isVisibleAdvertise:false
      })
      this.viewAdvertisementAPICalled()
      var url = this.state.currentAdvertimementData.AdUrl
      var prefix = 'http';
      if (url.substr(0, prefix.length) !== prefix)
      {
        url = prefix + "://" + url;
      }
      console.log("URL :=",url)
      if (Linking.canOpenURL(url)) {
          Linking.openURL(url)
      }
      else {
          alert("Advertisement url is not valid")
      }
   }

   hideAdvertiseMent() {
     this.setState({
       isVisibleAdvertise:false
     })
    //  this.startCounterForNextAdvertisemet()
   }

   startCounterForNextAdvertisemet() {
    var that = this
    timerVar = setTimeout(()=>{
      that.loadAdvertisements()
    }, 5000);
   }

   getAdvertisementList() {
    NetInfo.isConnected.fetch().then(isConnected => {
        console.log(isConnected)
        console.log('First, is ' + (isConnected ? 'online' : 'offline'));        
        if(isConnected) {
          var param = {
              'DeviceType': Platform.OS === 'ios' ? 1 : 2,
              'DeviceId': DeviceInfo.getUniqueID(),
              'PageNumber': this.state.PageNumber,
              'PageSize': this.state.PageSize,
          }
          console.log("param is ",param);
        //   this.setState({
        //     isLoading : true
        //   })
          ws.callWebservice('getAdvertisementList',param,'')
        }
        else {
          alert(Constant.NETWORK_ALERT)
        }
    });
   }

   viewAdvertisementAPICalled() {
      NetInfo.isConnected.fetch().then(isConnected => {
          console.log(isConnected)
          console.log('First, is ' + (isConnected ? 'online' : 'offline'));        
          if(isConnected) {
            var param = {
                'DeviceType': Platform.OS === 'ios' ? 1 : 2,
                'DeviceId': DeviceInfo.getUniqueID(),
                'AdvertisementsId': this.state.currentAdvertimementData.AdvertisementsId
            }
            console.log("param is ",param);
          //   this.setState({
          //     isLoading : true
          //   })
            ws.callWebservice('AdvertisementClick',param,'')
          }
          else {
            alert(Constant.NETWORK_ALERT)
          }
      });
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
        mapViewListScreen: {screen: MapViewListScreen},
        searchByLocationDirection: {screen: SearchByLocationDirection}
    },
    {
      headerMode: "none",
      mode: "card",
      initialRouteName: "home"
    }
  );
};