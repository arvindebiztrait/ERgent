/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Modal,
  Alert,
  PermissionsAndroid,
  AsyncStorage,
  NetInfo,
  Linking,
  StatusBar
} from 'react-native';

import Constant from './GeneralClass/Constant';
import Permissions from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import FusedLocation from 'react-native-fused-location';
import DeviceInfo from 'react-native-device-info';
import ws from './GeneralClass/webservice';
import Events from 'react-native-simple-events';

var timerVar;

export default class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isShowPopup:false,
            userLocation:{
                latitude: 0.0,
                longitude: 0.0,
            },
            isVisibleAdvertise:false,
            arrAdvertisements:[],
            advertiseIndex:0,
            currentAdvertimementData: {},
            PageNumber:1,
            PageSize: 100,
        };
    }

    async componentDidMount() {
        Events.on('receiveResponse', 'receiveHome', this.onReceiveResponse.bind(this)) 

        var that = this

        clearTimeout(timerVar)

        timerVar = setTimeout(()=>{
          that.getAdvertisementList()
        }, 5000);

        AsyncStorage.getItem("isShowFirstTimePopup").then((value1) => {
            console.log("isShowFirstTimePopup:=",value1) 
            if(value1 == null) {
                this.setState({
                    isShowPopup:true
                })
                console.log("isShowFirstTimePopup Null")                                
            }
            else {
                console.log("isShowFirstTimePopup Not Null")
            } 
        }).done();

        console.log("Device Id:=",DeviceInfo.getUniqueID())

        if (Platform.OS === 'ios') {
            Permissions.check('location','whenInUse')
            .then(response => {
              //returns once the user has chosen to 'allow' or to 'not allow' access
              //response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
              // this.setState({ photoPermission: response })
              console.log('location Permission:=',response)
              if (response == 'authorized') {
                this.getUserCurrentLocation()
              }
              else if (response == 'undetermined') {
                  Permissions.request('location','whenInUse').then(response => {
                  // Returns once the user has chosen to 'allow' or to 'not allow' access
                  // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                  if(response=='authorized') {
                    this.getUserCurrentLocation()
                  }
                })
              }
              else {
                console.log('called error part')
                Alert.alert(
                    Constant.APP_NAME,
                    'Your location access is denied, Please allow location access',
                    Platform.OS == 'ios' ?
                    [
                        {text: 'Cancel', onPress: () => console.log('cancel')},
                        {text: 'Okay', onPress: () => {Permissions.openSettings()}},
                    ] : [{text: 'Okay', onPress: () => console.log('cancel')}],
                    { cancelable: false }
                )
              }
            });
        }
        else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                    title: 'App needs to access your location',
                    message: 'App needs to access your location' +
                    'so we can find near your professional'
                }
            );
            if (granted) {

                console.log("Permission granted:= true",granted)

                // this.getUserCurrentLocation()
                RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
                .then(data => {
                    console.log("GPS ON:=",data)
                    // The user has accepted to enable the location services
                    // data can be :
                    //  - "already-enabled" if the location services has been already enabled
                    //  - "enabled" if user has clicked on OK button in the popup

                    this.getUserLocaationAndroid()

                }).catch(err => {
                    console.log("GPS OFF:=",err)
                    // The user has not accepted to enable the location services or something went wrong during the process
                    // "err" : { "code" : "ERR00|ERR01|ERR02", "message" : "message"}
                    // codes : 
                    //  - ERR00 : The user has clicked on Cancel button in the popup
                    //  - ERR01 : If the Settings change are unavailable
                    //  - ERR02 : If the popup has failed to open
                });                
            }
        }
    }

    async getUserLocaationAndroid() {
        FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY)
        // Get location once.
        const location = await FusedLocation.getFusedLocation()
        console.log("User Location Android:=",location)

        this.setState({
            userLocation: {
                latitude: location.latitude,
                longitude: location.longitude,
            }
        });
    }

    getUserCurrentLocation() {
        this.watchID = navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Current Location:=",position)
                this.setState({
                    userLocation: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }
                });
            },
            (error) => console.log(error.error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },);
    }

    onReceiveResponse (responceData) { 
       
        if (responceData.MethodName == 'getAdvertisementList') {
          console.log('responceDataHome:=',responceData)
            
            if (responceData.Status == true) {                    
                let advertiseList = responceData.Results.SymptomsData;
                
                // this.setState({
                //     arrAdvertisements : advertiseList,
                // })
                this.state.arrAdvertisements = advertiseList
                this.startCounterForAdvertisement()
            }
            else {
                // this.setState({
                //     isLoading:false
                // })
                alert(responceData.ErrorMessage)
            }
        }    
        else if (responceData.MethodName == 'AdvertisementClick') {
            console.log("responceData:=",responceData)
        }
    }

    render() {

        var strURL = ""
        if (this.state.currentAdvertimementData.ImagePath) {
          strURL = this.state.currentAdvertimementData.ImagePath
        }
        console.log("strURL:=",strURL)

        return (
            <View style={{
                flex: 1,
                // justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(239,240,241,1)',
                // backgroundColor:'red',
            }}>

            {/* Header View */}
            <View style={{
                height: Platform.OS === 'ios' ? 64 : 54,
                backgroundColor:'rgba(227,54,74,1)',
                width:'100%',
                justifyContent:'center',
                alignItems:'center',
                shadowColor:'gray',
                shadowOpacity:1.0,
                shadowOffset:{ width: 0, height: 2 },
                elevation:5
            }}>

                <Text style={{
                    color:'white',
                    fontSize: 18,
                    fontWeight:'bold',
                    marginTop: Platform.OS === 'ios' ? 12 : 0,
                    fontFamily:"Lato-Bold"
                }}>HOME</Text>

            </View>

            <View style={{
                // backgroundColor:'red',
                marginTop:100,
                width:Constant.DEVICE_WIDTH - 30,
                alignItems:'center',
                justifyContent:'center',
                flexDirection:'row',
            }}>
                <View style={{
                    borderWidth:0.5,
                    width: Platform.OS === 'ios' ? 92 : 87,
                    borderColor:'rgba(218,219,220,1)',
                }}></View>
                <Text style={{
                    fontSize:16,
                    fontWeight: 'bold',
                    // backgroundColor:'yellow',
                    marginHorizontal:10,
                    fontFamily:"Lato-Semibold"
                }}>How Can We Help?</Text>
                <View style={{
                    borderWidth:0.5,
                    width: Platform.OS === 'ios' ? 92 : 87,
                    borderColor:'rgba(218,219,220,1)',
                }}></View>
            </View>

            <TouchableWithoutFeedback onPress={
                    this.gotoShortestWaitTime.bind(this)
                }>
                <View style={{
                    height:55,
                    backgroundColor:'rgba(254,255,255,1)',
                    width:Constant.DEVICE_WIDTH-30,
                    marginTop:50,
                    justifyContent:'center',
                    flexDirection:'row',
                    alignItems:'center',
                    shadowColor:'gray',
                    shadowOpacity:0.5,
                    shadowOffset:{ width: 0, height: 1 },
                    borderRadius:2.0,
                    elevation:2
                }}> 
                    <Image style={{
                        height:45,
                        width:45,
                        // backgroundColor:'red',
                        marginLeft:5,
                    }}
                    source={require('../Images/wait-time.png')}
                    resizeMode='center'
                    ></Image>

                    <Text style={{
                        width:Constant.DEVICE_WIDTH-140,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        fontSize:17,
                        color:'rgba(114,114,115,1)',
                        fontFamily:"Lato-Regular"
                    }}>Shortest Wait Time</Text>

                    <Image style={{
                        height:20,
                        width:45,
                        // backgroundColor:'red',
                        marginLeft:5,
                    }}
                    source={require('../Images/next.png')}
                    resizeMode='center'
                    // resizeMethod='auto'
                    ></Image>

                </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={
                    this.gotoSymtoms.bind(this)
                }>
                <View style={{
                    height:55,
                    backgroundColor:'rgba(254,255,255,1)',
                    width:Constant.DEVICE_WIDTH-30,
                    marginTop:10,
                    justifyContent:'center',
                    flexDirection:'row',
                    alignItems:'center',
                    shadowColor:'gray',
                    shadowOpacity:0.5,
                    shadowOffset:{ width: 0, height: 1 },
                    borderRadius:2.0,
                    elevation:2,
                }}> 
                    <Image style={{
                        height:45,
                        width:45,
                        // backgroundColor:'red',
                        marginLeft:5,
                    }}
                    source={require('../Images/symptoms.png')}
                    resizeMode='center'
                    ></Image>

                    <Text style={{
                        width:Constant.DEVICE_WIDTH-140,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        fontSize:17,
                        color:'rgba(114,114,115,1)',
                        fontFamily:"Lato-Regular"
                    }}>Search by Symptoms</Text>

                    <Image style={{
                        height:20,
                        width:45,
                        // backgroundColor:'red',
                        marginLeft:5,
                    }}
                    source={require('../Images/next.png')}
                    resizeMode='center'
                    ></Image>

                </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={
                    this.gotoSearch.bind(this)
                }>
                <View style={{
                    height:55,
                    backgroundColor:'white',
                    width:Constant.DEVICE_WIDTH-30,
                    marginTop:10,
                    justifyContent:'center',
                    flexDirection:'row',
                    alignItems:'center',
                    shadowColor:'gray',
                    shadowOpacity:0.5,
                    shadowOffset:{ width: 0, height: 1 },
                    borderRadius:2.0,
                    elevation:2,
                }}> 
                    <Image style={{
                        height:45,
                        width:45,
                        // backgroundColor:'red',
                        marginLeft:5,
                    }}
                    source={require('../Images/location.png')}
                    resizeMode='center'
                    ></Image>

                    <Text style={{
                        width:Constant.DEVICE_WIDTH-140,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        fontSize:17,
                        color:'rgba(114,114,115,1)',
                        fontFamily:"Lato-Regular"
                    }}>Search By Location</Text>

                    <Image style={{
                        height:20,
                        width:45,
                        // backgroundColor:'red',
                        marginLeft:5,
                    }}
                    source={require('../Images/next.png')}
                    resizeMode='center'
                    ></Image>

                </View>
            </TouchableWithoutFeedback>

            <View style={{
                height:40,
                // backgroundColor:'white',
                width:Constant.DEVICE_WIDTH-30,
                marginTop:30,
                justifyContent:'center',
                flexDirection:'row',
                alignItems:'center',
            }}> 
                <TouchableWithoutFeedback onPress={
                    this.gotoPrivacyPolicy.bind(this)
                }>
                    <View style={{
                        width:'50%',
                        // backgroundColor:'red',
                        height:'100%',
                        justifyContent:'center',
                        alignItems:'center',
                        borderRightWidth:0.5,
                        borderRightColor:'gray'
                    }}>
                        <Text style={{
                            color:'rgba(114,114,115,1)',
                            fontFamily:"Lato-Regular"
                        }}>Privacy Policy</Text>
                    </View>    
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={
                    this.gotoTermsAndConditions.bind(this)
                }>
                    <View style={{
                        width:'50%',
                        height:'100%',
                        justifyContent:'center',
                        alignItems:'center',
                    }}>
                        <Text style={{
                            color:'rgba(114,114,115,1)',
                            fontFamily:"Lato-Regular"
                        }}>Terms & Conditions</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>

            <View style={{
                // backgroundColor:'red',
                marginTop:30,
            }}>
                <Image style={{
                    // backgroundColor:'yellow',
                    // flex:320,
                    width:175
                }}
                source={require('../Images/Logo_Home.png')}
                resizeMode='contain'
                />
            </View>

            {this.state.isVisibleAdvertise === true ?
            <TouchableWithoutFeedback onPress={this.viewAdvertisement.bind(this)}>
            <View style={{
                position:'absolute',
                zIndex: 1,
                backgroundColor: 'white',
                marginLeft:0,
                marginTop: Platform.OS === 'ios' ? Constant.DEVICE_HEIGHT - 64 : (Constant.DEVICE_HEIGHT - (64 + StatusBar.currentHeight)),
                height: 64,
                width: Constant.DEVICE_WIDTH,
                // alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Image style={{
                        // backgroundColor:'rgba(227,54,74,1)',
                        height:'100%',
                        width:'100%',
                        // borderRadius:50,
                        // borderWidth:1,
                        // borderColor:'rgba(227,54,74,1)'
                    }}
                    // source={require('../Images/logo-popup.png')}
                    source={{ uri: strURL}}
                    resizeMode={'contain'}
                    onLoad={this.startCounterForNextAdvertisemet.bind(this)}
                />
                {/* <TouchableWithoutFeedback onPress={this.viewAdvertisement.bind(this)}>
                    <Text style={{
                        padding: 10,
                        borderColor: 'black',
                        color: 'black',
                        borderWidth: 1,
                        zIndex: 1,
                        position: 'absolute',
                        width: 60,
                        textAlign: 'center',
                        marginLeft: Constant.DEVICE_WIDTH - 70,
                        borderRadius: 5,
                    }}>View</Text>
                </TouchableWithoutFeedback> */}
            </View>
            </TouchableWithoutFeedback>

            : undefined}

            <Modal visible={this.state.isShowPopup} animationType={'fade'} transparent={true} onRequestClose={this.onModalCloseAction.bind(this)}>
                <View style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: Constant.DEVICE_WIDTH-50,
                        height: 269,
                        backgroundColor: 'white',
                        shadowColor: 'gray',
                        shadowOpacity: 0.5,
                        shadowOffset:{ width: 0, height: 1 },
                        borderRadius:5,
                        alignItems:'center',
                        overflow:'hidden',
                    }}>
                        <Text style={{
                            marginTop:100,
                            fontWeight:'bold',
                            fontFamily:"Lato-Bold"
                        }}>Message from the ERgent team</Text>

                        <Text style={{
                            color:'rgba(167,174,186,1)',
                            textAlign: 'center',
                            marginTop: 20,
                            marginHorizontal : 10,
                            fontFamily:"Lato-Regular"
                        }}>
                            If you are requesting the immediate wait time, please call the hospital. If you are having a heart attack, stroke, or any life-threatening emergency, please call <Text style={{
                                color:'rgba(227,54,74,1)',
                                fontFamily:"Lato-Regular"
                            }}>911</Text>
                        </Text>
                        
                        <TouchableWithoutFeedback onPress={this.onClickUnderstand.bind(this)}>
                            <View style={{
                                backgroundColor: 'rgba(227,54,74,1)',
                                height:45,
                                width:'100%',
                                marginTop: 20,
                                justifyContent:'center',
                                alignItems:'center',
                            }}>
                                <Text style={{
                                    color:'white',
                                    fontFamily:"Lato-Semibold"
                                }}>I Understand</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={{
                        position:'absolute',
                        backgroundColor: 'white',
                        height:120,
                        width:120,
                        zIndex:1,
                        borderRadius:60,
                        marginBottom:150,
                        marginLeft:(Constant.DEVICE_WIDTH-120)/2,
                        marginTop:(Constant.DEVICE_HEIGHT-120)/2 - 120,
                        justifyContent:'center',
                        alignItems:'center',
                    }}>
                        <Image style={{
                            // backgroundColor:'rgba(227,54,74,1)',
                            height:100,
                            width:100,
                            borderRadius:50,
                            borderWidth:1,
                            borderColor:'rgba(227,54,74,1)'
                        }}
                        source={require('../Images/logo-popup.png')}
                        >
                        </Image>
                    </View>
            </Modal>
        </View>
    );
  }

  onModalCloseAction() {

  }

    onClickUnderstand() {
        AsyncStorage.setItem('isShowFirstTimePopup','1')
        this.setState({
            isShowPopup:false
        })
    }

  gotoPrivacyPolicy() {
    console.log("on Click Privacy Policy")
    this.props.navigation.push('termsConditions',{'isForPrivacy':'1'})
  }

  gotoTermsAndConditions() {
    console.log("on Click Terms & Conditions")
    this.props.navigation.push('termsConditions',{'isForPrivacy':'0'})
  }

  gotoShortestWaitTime() {
    this.props.navigation.push('shortestWaitTimeList',{'userLocation':this.state.userLocation})
  }

  gotoSymtoms() {
      this.props.navigation.push('symtomsList',{'userLocation':this.state.userLocation})
  }

  gotoSearch() {
    this.props.navigation.push('searchByLocation', {'isForSearch':true})
  }

  

  startCounterForAdvertisement() {
    var that = this
    clearTimeout(timerVar)
    timerVar = setTimeout(()=>{
      that.loadAdvertisements()
    }, 5000);
  }

  loadAdvertisements() {
      console.log("loadAdvertisements called")
    if (this.state.advertiseIndex < this.state.arrAdvertisements.length) {
      var adData = this.state.arrAdvertisements[this.state.advertiseIndex]
      this.setState({
        advertiseIndex : this.state.advertiseIndex + 1,
        currentAdvertimementData : adData,
        isVisibleAdvertise: true
      })
    }
    else {
        this.state.advertiseIndex = 0
        this.getAdvertisementList()
    }
  }

  viewAdvertisement() {
    // this.setState({
    //   isVisibleAdvertise:false
    // })
    this.viewAdvertisementAPICalled()
    var url = this.state.currentAdvertimementData.AdUrl
    console.log("currentAdvertimementData:=",this.state.currentAdvertimementData)
    console.log("url:=",url)
    var prefix = 'http';
    if (url.substr(0, prefix.length) !== prefix) {
      url = prefix + "://" + url;
    }
    console.log("URL :=",url)
    if (Linking.canOpenURL(url)) {
        this.startCounterForNextAdvertisemet()
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
     console.log("startCounterForNextAdvertisemet called")
  var that = this
  clearTimeout(timerVar)
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
