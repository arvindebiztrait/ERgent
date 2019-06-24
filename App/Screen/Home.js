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
  StatusBar,
} from 'react-native';

import Constant from './GeneralClass/Constant';
import Permissions from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import FusedLocation from 'react-native-fused-location';
import DeviceInfo from 'react-native-device-info';
import ws from './GeneralClass/webservice';
import Events from 'react-native-simple-events';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
var timerVar;

export default class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isShowPopup: false,
            isShowPopupForOptions: false,
            intOptionIndex: 0,
            isShowPopupHowDoesERgentWork: false,
            userLocation: {
                latitude: 0.0,
                longitude: 0.0,
            },
            isVisibleAdvertise: false,
            arrAdvertisements: [],
            advertiseIndex: 0,
            currentAdvertimementData: {},
            PageNumber: 1,
            PageSize: 100,
            isSelectedTC: false,
            isSelectedPP: false,
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
                // alert(responceData.ErrorMessage)
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
        // console.log("strURL:=",strURL)

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
                height: isIphoneX() ? 74 : Platform.OS === 'ios' ? 64 : 54,
                backgroundColor:'rgba(227,54,74,1)',
                width:'100%',
                justifyContent:'center',
                alignItems:'center',
                shadowColor:'gray',
                shadowOpacity:1.0,
                shadowOffset:{ width: 0, height: 2 },
                elevation:5
            }}>

                <Text 
                allowFontScaling={false}
                style={{
                    color:'white',
                    fontSize: 18,
                    fontWeight:'bold',
                    marginTop: isIphoneX() ? 20 : Platform.OS === 'ios' ? 12 : 0,
                    fontFamily:"Lato-Bold"
                }}>HOME</Text>

            </View>

            <KeyboardAwareScrollView 
                keyboardShouldPersistTaps={'handled'}
                ref={'scrollView'}
            >
            <View>
            <View style={{
                // backgroundColor:'red',
                marginTop:80,
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
                <Text 
                allowFontScaling={false}
                style={{
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
                    // this.gotoShortestWaitTime.bind(this)
                    this.onClickERgentRecommendations.bind(this)
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

                    <Text 
                    allowFontScaling={false}
                    style={{
                        width:Constant.DEVICE_WIDTH-140,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        fontSize:17,
                        color:'rgba(114,114,115,1)',
                        fontFamily:"Lato-Regular"
                    }}>ERgent's Recommendation</Text>

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
                    // this.gotoSymtoms.bind(this)
                    this.onClickSearchBySymptoms.bind(this)
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

                    <Text 
                    allowFontScaling={false}
                    style={{
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
                // this.gotoSearch.bind(this)
                this.onClickSearchByLocation.bind(this)
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

                    <Text 
                    allowFontScaling={false}
                    style={{
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
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text 
                allowFontScaling={false}
                style={{
                    color:'rgba(114,114,115,0.8)',
                    fontFamily:"Lato-Regular",
                    marginTop: 30,
                    // fontSize: 14,
                }}>If this is an emergency, please contact 911.</Text>
            </View>

            <View style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <TouchableWithoutFeedback onPress={this.onClickHowDoesERgentWork.bind(this)}>
                    <View style={{
                        height: 30,
                        justifyContent: 'center', 
                        marginTop: 15,
                    }}>
                        <Text 
                        allowFontScaling={false}
                        style={{
                            color:'rgba(227,54,74,1)',
                            // backgroundColor:'rgba(227,54,74,1)',
                            fontFamily:"Lato-Semibold",
                            // marginTop: 30,
                        }}>How Does ERgent Work?</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={{
                height:40,
                // backgroundColor:'white',
                width:Constant.DEVICE_WIDTH-30,
                marginTop:15,
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
                        <Text 
                        allowFontScaling={false}
                        style={{
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
                        <Text 
                        allowFontScaling={false}
                        style={{
                            color:'rgba(114,114,115,1)',
                            fontFamily:"Lato-Regular"
                        }}>Terms & Conditions</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <TouchableWithoutFeedback onPress={this.onClickTellUsWhatYouThink.bind(this)}>
                    <View style={{
                        height: 30,
                        justifyContent: 'center', 
                        marginTop: 10,
                    }}>
                        <Text 
                        allowFontScaling={false}
                        style={{
                            color:'rgba(114,114,115,1)',
                            // backgroundColor:'rgba(227,54,74,1)',
                            fontFamily:"Lato-Regular",
                            // marginTop: 30,
                        }}>Tell Us What You Think</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>            
                <View style={{
                    // backgroundColor:'red',
                    marginTop:10,
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

            {this.loadHowDoesERgentWorkView()}
            {this.loadPopUpForOptionsProcess()}
            {/* {this.loadEmergencyFirstTimePopUp()} */}
            {this.loadTermsAndConditionsFirstTimePopUp()}

            </View>
            </KeyboardAwareScrollView>
        </View>
        );
    }

    loadEmergencyFirstTimePopUp() {
        return(
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
                        <Text 
                        allowFontScaling={false}
                        style={{
                            marginTop:80,
                            height:22,
                            fontWeight:'bold',
                            fontFamily:"Lato-Bold",
                            // backgroundColor:'red'
                        }}
                        >Message from the ERgent team</Text>

                        <Text 
                        allowFontScaling={false}
                        style={{
                            color:'rgba(167,174,186,1)',
                            textAlign: 'center',
                            marginTop: 20,
                            height:82,
                            marginHorizontal : 10,
                            // backgroundColor:'yellow',
                            fontSize:14,
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
                                }}
                                allowFontScaling={false}>I Understand</Text>
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
        )
    }

    loadTermsAndConditionsFirstTimePopUp() {
        return(
            <Modal visible={this.state.isShowPopup} animationType={'fade'} transparent={true} onRequestClose={this.onModalCloseAction.bind(this)}>
                <View style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    flex: 1,
                    // justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: Constant.DEVICE_WIDTH-50,
                        height: Constant.DEVICE_HEIGHT - (Platform.OS === 'ios' ? 100 : 140),
                        backgroundColor: 'white',
                        shadowColor: 'gray',
                        shadowOpacity: 0.5,
                        shadowOffset:{ width: 0, height: 1 },
                        borderRadius:5,
                        alignItems:'center',
                        overflow:'hidden',
                        marginTop: 80,
                    }}>
                        <Text 
                        allowFontScaling={false}
                        style={{
                            marginTop:70,
                            height:22,
                            fontWeight:'bold',
                            fontFamily:"Lato-Bold",
                            // backgroundColor:'red'
                        }}
                        >Terms & Conditions</Text>
                        <KeyboardAwareScrollView style={{
                            // backgroundColor: 'red'
                        }}>
                        {/* <View style={{
                            backgroundColor: 'green',
                        }}> */}
                        {this.loadTC()}
                        {/* </View> */}
                        </KeyboardAwareScrollView>
                        <TouchableWithoutFeedback onPress={this.onClickTermsAndConditions.bind(this)}>
                            <View style={{
                                // height:45,
                                width: Constant.DEVICE_WIDTH - 50,
                                // justifyContent:'center',
                                alignItems:'center',
                                flexDirection: 'row',
                                marginTop: 5,
                            }}>
                                <Image style={{
                                    height: 20,
                                    width: 20,
                                    marginLeft: 10,
                                }}
                                source={this.state.isSelectedTC === true ? require('../Images/check_box_selected.png') : require('../Images/check_box_unselected_BT.png')}
                                resizeMode={'contain'}
                                />
                                <Text style={{
                                    // color:'white',
                                    fontFamily:"Lato-Regular",
                                    fontSize: 12,
                                    width: Constant.DEVICE_WIDTH - 50 - 50,
                                    marginLeft: 10,
                                }}
                                allowFontScaling={false}>I acknowledge that I have read, understood, and accept the above Terms and Conditions</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.onClickPrivacyPolicy.bind(this)}>
                            <View style={{
                                // height:45,
                                width: Constant.DEVICE_WIDTH - 50,
                                // justifyContent:'center',
                                alignItems:'center',
                                flexDirection: 'row',
                                marginVertical: 5,
                            }}>
                                <Image style={{
                                    height: 20,
                                    width: 20,
                                    marginLeft: 10,
                                }}
                                source={this.state.isSelectedPP === true ? require('../Images/check_box_selected.png') : require('../Images/check_box_unselected_BT.png')}
                                resizeMode={'contain'}
                                />
                                <Text style={{
                                    // color:'white',
                                    fontFamily:"Lato-Regular",
                                    fontSize: 12,
                                    width: Constant.DEVICE_WIDTH - 50 - 50,
                                    marginLeft: 10,
                                }}
                                allowFontScaling={false}>I accept the <TouchableWithoutFeedback onPress={this.onClickPrivacyPolicyOpen.bind(this)}><Text style={{
                                    color: 'blue',
                                    textDecorationLine: 'underline',
                                }}>Privacy Policy</Text></TouchableWithoutFeedback></Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.onClickUnderstand.bind(this)}>
                            <View style={{
                                backgroundColor: 'rgba(227,54,74,1)',
                                height:45,
                                width:'100%',
                                justifyContent:'center',
                                alignItems:'center',
                            }}>
                                <Text style={{
                                    color:'white',
                                    fontFamily:"Lato-Bold"
                                }}
                                allowFontScaling={false}>I ACCEPT</Text>
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
                        marginTop: 30, //(Constant.DEVICE_HEIGHT-120)/2 - 135,
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
        )
    }

    onClickTermsAndConditions() {
        this.setState({
            isSelectedTC: !this.state.isSelectedTC,
        })
    }

    onClickPrivacyPolicy() {
        this.setState({
            isSelectedPP: !this.state.isSelectedPP,
        })
    }

    onClickPrivacyPolicyOpen() {
        var strURL = "http://www.ergentapp.com/privacy-policy"
        if (Linking.canOpenURL(strURL)) {
            Linking.openURL(strURL)
        }
    }

    loadTC() {
        return(
            <View>
            <Text 
            allowFontScaling={false}
            style={{
                // color:'rgba(167,174,186,1)',
                color: 'gray',
                marginTop: 20,
                marginHorizontal : 10,
                fontSize:14,
                fontFamily:"Lato-Regular",
                paddingBottom: 10,
                lineHeight: 20,
            }}>
                The following terms and conditions (the “Terms and Conditions”) govern your use of this website and app (www.ergentapp.com and ERgent) provided to you by ERgent, LLC (the “Company”) or any of its affiliates, subsidiaries, and any content made available from or through this website and app, including any subdomains thereof, or application (collectively, the “Site”).  Such content includes any and all information, text, graphics, or other materials appearing on the Site.  The Site is made available by the Company and/or its affiliates, subsidiaries (“we” or “us” or “our”), each of which have adopted these Terms and Conditions with regard to its website. We may change the Terms and Conditions from time to time, at any time without notice to you, by posting such changes on the Site. BY USING THE SITE, YOU ACCEPT AND AGREE TO THESE TERMS AND CONDITIONS AS APPLIED TO YOUR USE OF THE SITE. If you do not agree to these Terms and Conditions, you may not access or otherwise use the Site.  In addition, we may send you an email informing you that the Terms and Conditions have changed.
ERgent is an app designed to get you to an emergency department within a hospital based on your GPS location or any other location given and average waiting times within the hospital. This data is public information collected from a number of public and government sources, and such data should only be used for informational purposes and not be considered as medical advice in any manner. 
Proprietary Rights.{'\n'}{'\n'}
As between you and us, we own, solely and exclusively, all rights, title and interest in and to the Site, all the content (including, for example, audio, photographs, illustrations, graphics, other visuals, video, copy, text, software, titles, etc.), code, data and materials thereon, the look and feel, design and organization of the Site, and the compilation of the content, code, data and materials on the Site, including but not limited to any copyrights, trademark rights, patent rights, database rights, moral rights, sui generis rights and other intellectual property and proprietary rights therein. Your use of the Site does not grant to you ownership of any content, code, data or materials you may access on or through the Site.
Limited License.{'\n'}{'\n'}
You may access and view the content on the Site on your computer or other device and, unless otherwise indicated in these Terms and Conditions or on the Site, make single copies or prints of the content on the Site for your personal, internal use only.  Use of the Site and any services offered on or through the Site are only for your personal, non-commercial use.
Prohibited Use.{'\n'}{'\n'}
Any commercial or promotional distribution, publishing or exploitation of the Site, or any content, code, data or materials on the Site, is strictly prohibited unless you have received express prior written permission from our authorized personnel or the otherwise applicable rights holder. Other than as expressly allowed herein (such as in the case of personal social media accounts), you may not download, post, display, publish, copy, reproduce, distribute, transmit, modify, perform, broadcast, transfer, create derivative works from, sell or otherwise exploit any content, code, data or materials on or available through the Site.  You further agree that you may not alter, edit, delete, remove, otherwise change the meaning or appearance of, or repurpose, any of the content, code, data, or other materials on or available through the Site, including, without limitation, the alteration or removal of any trademarks, trade names, logos, service marks, or any other proprietary content or proprietary rights notices. You acknowledge that you do not acquire any ownership rights by downloading any copyrighted material from or through the Site. If you make other use of the Site, or the content, code, data or materials thereon or available through the Site, except as otherwise provided above, you may violate copyright and other laws of the United States, other countries, as well as applicable state laws and may be subject to liability for such unauthorized use.
Trademarks.{'\n'}{'\n'}
The trademarks, logos, service marks and trade names (collectively the “Trademarks”) displayed on the Site or on content available through the Site are registered and unregistered Trademarks and may not be used in connection with products and/or services that are not related to, associated with, or sponsored by their rights holders that are likely to cause customer confusion, or in any manner that disparages or discredits their rights holders. All Trademarks not owned by us that appear on the Site or on or through the Site’s services, if any, are the property of their respective owners. Nothing contained on the Site should be construed as granting, by implication, estoppel, or otherwise, any license or right to use any Trademark displayed on the Site without our written permission or the third party that may own the applicable Trademark. Your misuse of the Trademarks displayed on the Site or on or through any of the Site’s services is strictly prohibited and at your own risk. 
User Information.{'\n'}{'\n'}
In the course of your use of the Site and/or the services made available on or through the Site, you may be asked to provide certain personalized information to us (such information referred to hereinafter as “User Information”). Our information collection and use policies with respect to the privacy of such User Information are set forth in the Site’s Privacy Policy which is incorporated herein by reference for all purposes. You acknowledge and agree that you are solely responsible for the accuracy and content of User Information.
Submitted Materials.{'\n'}{'\n'}
Unless specifically requested, we do not solicit nor do we wish to receive any confidential, secret or proprietary information or other material from you through the Site, by e-mail or in any other way. Any information, creative works, demos, ideas, suggestions, concepts, methods, systems, designs, plans, techniques or other materials submitted or sent to us (including, for example and without limitation, that which you submit or send to us via e-mail) (“Submitted Materials”) will be deemed not to be confidential or secret, and may be used by us in any manner consistent with the Site’s Privacy Policy. By submitting or sending Submitted Materials to us, you: (i) represent and warrant that the Submitted Materials are original to you, that no other party has any rights thereto, and that any “moral rights” in Submitted Materials have been waived, and (ii) you grant us and our affiliates a royalty-free, unrestricted, worldwide, perpetual, irrevocable, non-exclusive and fully transferable, assignable and sublicensable right and license to use, copy, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, display and incorporate in other works any Submitted Materials (in whole or part) in any form, media, or technology now known or later developed, including for promotional and/or commercial purposes. We cannot be responsible for maintaining any Submitted Material that you provide to us, and we may delete or destroy any such Submitted Material at any time.
Prohibited User Conduct.</Text>
            <Text 
            allowFontScaling={false}
            style={{
                // color:'rgba(167,174,186,1)',
                color: 'gray',
                marginTop: 20,
                marginHorizontal : 10,
                fontSize:14,
                fontFamily:"Lato-Regular",
                paddingBottom: 10,
            }}>You alone are responsible for the content and consequences of any of your activities.  You warrant and agree that, while using the Site and the various services and features offered on or through the Site, you shall not:
{'\n'}{'\n'}(a) impersonate any person or entity or misrepresent your affiliation with any other person or entity;
{'\n'}{'\n'}(b) insert your own or a third party’s advertising, branding or other promotional content into any of the Site’s content, materials or services (for example, without limitation, in an RSS feed or a podcast received from us or otherwise through the Site), or use, redistribute, republish or exploit such content or service for any further commercial or promotional purposes;
{'\n'}{'\n'}(c) engage in spidering, “screen scraping,” “database scraping,” harvesting of e-mail addresses, wireless addresses or other contact or personal information, or any other automatic means of obtaining lists of users or other information from or through the Site or any services offered on or through the Site, including without limitation, any information residing on any server or database connected to the Site or any services offered on or through the Site;
{'\n'}{'\n'}(d) obtain or attempt to obtain unauthorized access to our or other computer systems, materials or information through the Site by any means;
{'\n'}{'\n'}(e) use the Site or the services made available on or through the Site in any manner with the intent to interrupt, damage, disable, overburden, or impair the Site or such services, including, without limitation, sending mass unsolicited messages or “flooding” servers with requests;
{'\n'}{'\n'}(f) use the Site or the Site’s services or features in violation of our or any third party’s intellectual property or other proprietary or legal rights;
{'\n'}{'\n'}(g) use the Site or the Site’s services in violation of any applicable law;
{'\n'}{'\n'}(h) attempt (or encourage or support anyone else’s attempt) to circumvent, reverse engineer, decrypt, or otherwise alter or interfere with the Site or the Site’s services, or any content thereof, or make any unauthorized use thereof;
{'\n'}{'\n'}(i) use the Site in any manner that could damage, disable, overburden, or impair the Site or interfere with any other party’s use and enjoyment of the Site or any of its services;
{'\n'}{'\n'}(j) obtain or attempt to obtain any materials or information through any means not intentionally made publicly available or provided for through the Site;
{'\n'}{'\n'}(k) post, publish or transmit any text, graphics, or material that: (i) is false or misleading; (ii) is defamatory; (iii) invades another’s privacy; (iv) is obscene, pornographic, or offensive; (v) promotes bigotry, racism, hatred or harm against any individual or group; (vi) infringes another’s legal rights; or (vii) violates, or encourages any conduct that would violate, any applicable law or regulation or would give rise to civil or criminal liability; and
{'\n'}{'\n'}(l) send unsolicited email, junk mail, “spam,” chain letters, or promotions or advertisements for products or services.
{'\n'}{'\n'}(m) restrict or inhibit any other user from using and enjoying the Site or its Services.
            </Text>
            <Text 
            allowFontScaling={false}
            style={{
                // color:'rgba(167,174,186,1)',
                color: 'gray',
                marginTop: 20,
                marginHorizontal : 10,
                fontSize:14,
                fontFamily:"Lato-Regular",
                paddingBottom: 10,
            }}>
Linking to the Web Site.
You are not permitted to link directly to any image hosted on the Site or our services, such as using an "in-line" linking method to cause the image hosted by us to be displayed on another web site. You agree not to download or use images hosted on this Site on another web site, for any purpose, including, without limitation, posting such images on another site.  Such restriction does not apply to personal social media accounts. You agree not to link from any other web site to this Site in any manner such that the Site, or any page of the Site, is "framed," surrounded or obfuscated by any third party content, materials or branding. We reserve all of our rights under the law to insist that any link to the Site be discontinued, and to revoke your right to link to the Site from any other web site at any time upon written notice to you.
Indemnification.{'\n'}{'\n'}
You agree to defend, indemnify and hold us and our subsidiaries, affiliates and any directors, officers, employees and agents harmless from any and all claims, liabilities, costs and expenses, including reasonable attorneys’ fees, arising in any way from your use of the Site, your placement or transmission of any message, content, information, software or other materials through the Site, or your breach or violation of the law or of these Terms and Conditions. We reserve the right, at our own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, and in such case, you agree to cooperate with our defense of such claim.
Third Party Sites.{'\n'}{'\n'}
You may be able to link from the Site to third party Sites, and third party Sites may link to the Site (“Linked Sites”). You acknowledge and agree that we have no responsibility for the information, content, products, services, advertising, code or other materials which may or may not be provided by or through Linked Sites, even if they are owned or run by affiliates of ours. Links to Linked Sites do not constitute an endorsement or sponsorship by us of such Sites or the information, content, products, services, advertising, code or other materials presented on or through such Sites. The inclusion of any link to such sites on our Site does not imply our endorsement, sponsorship, or recommendation of that site. We disclaim any liability for links (1) from another Site to this Site and (2) to another Site from this Site. We do not guarantee the standards of any Site to which links are provided on this Site nor shall we be held responsible for the contents of such sites, or any subsequent links. We do not represent or warrant that the contents of any third party Site is accurate, compliant with state or federal law, or compliant with copyright or other intellectual property laws. Also, we are not responsible for or any form of transmission received from any linked Site. Any reliance on the contents of a third party Site is done so at your own risk and you assume all responsibilities and consequences resulting from such reliance.
DISCLAIMER OF WARRANTIES.{'\n'}{'\n'}
THE SITE, INCLUDING, WITHOUT LIMITATION, ALL SERVICES, CONTENT, FUNCTIONS AND MATERIALS PROVIDED THROUGH THE SITE, ARE PROVIDED “AS IS,” “AS AVAILABLE,” WITHOUT WARRANTY OR CONDITION OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTY FOR INFORMATION, DATA, DATA PROCESSING SERVICES, UNINTERRUPTED ACCESS, ANY WARRANTIES CONCERNING THE AVAILABILITY, PLAYABILITY, DISPLAYABILITY, ACCURACY, PRECISION, CORRECTNESS, THOROUGHNESS, COMPLETENESS, USEFULNESS, OR CONTENT OF INFORMATION, AND ANY WARRANTIES OF TITLE, QUIET ENJOYMENT, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. WE DO NOT WARRANT THAT THE SITE OR THE SERVICES, CONTENT, FUNCTIONS OR MATERIALS PROVIDED THROUGH THE SITE WILL BE TIMELY, SECURE, UNINTERRUPTED OR ERROR FREE, OR THAT DEFECTS WILL BE CORRECTED. WE MAKE NO WARRANTY THAT THE SITE OR THE PROVIDED SERVICES WILL MEET USERS’ REQUIREMENTS. NO ADVICE, RESULTS OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM US OR THROUGH THE SITE SHALL CREATE ANY WARRANTY NOT EXPRESSLY MADE HEREIN. 
WE AND OUR AFFILIATES ALSO ASSUME NO RESPONSIBILITY, AND SHALL NOT BE LIABLE FOR, ANY DAMAGES TO, OR VIRUSES THAT MAY INFECT, YOUR EQUIPMENT ON ACCOUNT OF YOUR ACCESS TO, USE OF, OR BROWSING IN THE SITE OR YOUR DOWNLOADING OF ANY MATERIALS, DATA, TEXT, IMAGES, VIDEO CONTENT, OR AUDIO CONTENT FROM THE SITE. IF YOU ARE DISSATISFIED WITH THE SITE, YOUR SOLE REMEDY IS TO DISCONTINUE USING THE SITE.
WE TRY TO ENSURE THAT THE INFORMATION POSTED ON THE SITE IS CORRECT AND UP-TO-DATE. WE RESERVE THE RIGHT TO CHANGE OR MAKE CORRECTIONS TO ANY OF THE INFORMATION PROVIDED ON THE SITE AT ANY TIME AND WITHOUT ANY PRIOR WARNING. WE NEITHER ENDORSE NOR ARE RESPONSIBLE FOR THE ACCURACY OR RELIABILITY OF ANY OPINION, ADVICE OR STATEMENT ON THE SITE, NOR FOR ANY OFFENSIVE, DEFAMATORY, OBSCENE, INDECENT, UNLAWFUL OR INFRINGING POSTING MADE THEREON BY ANYONE OTHER THAN OUR AUTHORIZED EMPLOYEE SPOKESPERSONS WHILE ACTING IN THEIR OFFICIAL CAPACITIES (INCLUDING, WITHOUT LIMITATION, OTHER USERS OF THE SITE). IT IS YOUR RESPONSIBILITY TO EVALUATE THE ACCURACY, COMPLETENESS OR USEFULNESS OF ANY INFORMATION, OPINION, ADVICE OR OTHER CONTENT AVAILABLE THROUGH THE SITE. PLEASE SEEK THE ADVICE OF PROFESSIONALS, AS APPROPRIATE, REGARDING THE EVALUATION OF ANY SPECIFIC INFORMATION, OPINION, ADVICE OR OTHER CONTENT.  UNDER NO CIRCUMSTANCES SHOULD THE INFORMATION PROVIDED ON THIS SITE BE CONSIDERED A DIAGNOSIS OR MEDICAL ADVICE OF ANY KIND.  IN THE EVENT OF AN EMERGENCY, IT IS ALWAYS ADVISABLE TO CALL 911.
WITHOUT LIMITATION OF THE ABOVE IN THIS SECTION, WE AND OUR AFFILIATES, SUPPLIERS AND LICENSORS MAKE NO WARRANTIES OR REPRESENTATIONS REGARDING ANY PRODUCTS OR SERVICES ORDERED OR PROVIDED VIA THE SITE, AND HEREBY DISCLAIM, AND YOU HEREBY WAIVE, ANY AND ALL WARRANTIES AND REPRESENTATIONS MADE IN PRODUCT OR SERVICES LITERATURE, AND OTHERWISE ON THE SITE OR IN CORRESPONDENCE WITH US OR OUR AGENTS. ANY PRODUCTS AND SERVICES ORDERED OR PROVIDED VIA THE SITE ARE PROVIDED BY US “AS IS,” EXCEPT TO THE EXTENT, IF AT ALL, OTHERWISE SET FORTH IN A LICENSE OR SALE AGREEMENT SEPARATELY ENTERED INTO IN WRITING BETWEEN YOU AND US OR OUR LICENSOR OR SUPPLIER.
LIMITATION OF LIABILITY.{'\n'}{'\n'}
IN NO EVENT, INCLUDING BUT NOT LIMITED TO NEGLIGENCE, SHALL WE, OUR SUBSIDIARIES, AFFILIATES, OR ANY OF OUR DIRECTORS, OFFICERS, EMPLOYEES, AGENTS OR CONTENT OR SERVICE PROVIDERS (COLLECTIVELY, THE “PROTECTED ENTITIES”) BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES ARISING FROM, OR DIRECTLY OR INDIRECTLY RELATED TO, THE USE OF, OR THE INABILITY TO USE, THE SITE OR THE CONTENT, MATERIALS AND FUNCTIONS RELATED THERETO, YOUR PROVISION OF INFORMATION VIA THE SITE, LOST BUSINESS OR LOST SALES, EVEN IF SUCH PROTECTED ENTITY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO CERTAIN USERS. IN NO EVENT SHALL THE PROTECTED ENTITIES BE LIABLE FOR OR IN CONNECTION WITH ANY CONTENT POSTED, TRANSMITTED, EXCHANGED OR RECEIVED BY OR ON BEHALF OF ANY USER OR OTHER PERSON ON OR THROUGH THE SITE.  IN NO EVENT SHALL THE TOTAL AGGREGATE LIABILITY OF THE PROTECTED ENTITIES TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION (WHETHER IN CONTRACT OR TORT, INCLUDING, BUT NOT LIMITED TO, NEGLIGENCE OR OTHERWISE) ARISING FROM THE TERMS AND CONDITIONS OR YOUR USE OF THE SITE EXCEED, IN THE AGGREGATE, THE AMOUNT, IF ANY, PAID BY YOU TO US FOR YOUR USE OF THE SITE.
Applicable Laws.{'\n'}{'\n'}
We control and operate the Site from our offices in the United States. We do not represent that materials on the Site are appropriate or available for use in other locations. Persons who choose to access the Site from other locations do so on their own initiative, and are responsible for compliance with local laws, if and to the extent local laws are applicable. All parties to these Terms and Conditions waive their respective rights to a trial by jury.
Termination.{'\n'}{'\n'}
We may terminate, change, suspend or discontinue any aspect of the Site or the Site’s services at any time. We may restrict, suspend or terminate your access to the Site and/or its services if we believe you are in breach of our Terms and Conditions or applicable law, or for any other reason without notice or liability. We maintain a policy that provides for the termination in appropriate circumstances of the Site use privileges of users who are repeat infringers of intellectual property rights.
Changes to Terms and Conditions.{'\n'}{'\n'}
We reserve the right, at our sole discretion, to change, modify, add or remove any portion of the Terms and Conditions, in whole or in part, at any time. Changes in the Terms and Conditions will be effective when posted. Your continued use of the Site and/or the services made available on or through the Site after any changes to the Terms and Conditions are posted will be considered acceptance of those changes.
Severability{'\n'}{'\n'}
If any provision of the Terms and Conditions is found by a court of competent jurisdiction to be invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties’ intentions as reflected in the provision, and the other provisions of the Terms and Conditions remain in full force and effect.
Waiver.{'\n'}{'\n'}
The failure of the Company to enforce any right or provision of these Terms and Conditions will not be deemed a waiver of such right or provision.
Controlling Law and Jurisdiction.{'\n'}{'\n'}
The Terms and Conditions, and the relationship between you and us, shall be governed by the laws of the state of Florida, without regard to its conflict of law provisions. You agree that any cause of action that may arise under the Terms and Conditions shall be commenced and be heard in the appropriate court in the state of Florida. You agree to submit to the personal and exclusive jurisdiction of the state and federal courts located within the state of Florida, and each of the parties hereto waive any objection to jurisdiction and venue in such courts.
                </Text>
            </View>
        )
    }

    loadPopUpForOptionsProcess() {
        return(
            <Modal visible={this.state.isShowPopupForOptions} animationType={'fade'} transparent={true} onRequestClose={this.onModalCloseAction.bind(this)}>
                <View style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: Constant.DEVICE_WIDTH-50,
                        height: 370,
                        backgroundColor: 'white',
                        shadowColor: 'gray',
                        shadowOpacity: 0.5,
                        shadowOffset:{ width: 0, height: 1 },
                        borderRadius:5,
                        alignItems:'center',
                        overflow:'hidden',
                    }}>
                        <Text 
                        allowFontScaling={false}
                        style={{
                            marginTop:80,
                            height:22,
                            fontWeight:'bold',
                            fontFamily:"Lato-Bold",
                            // backgroundColor:'red'
                        }}
                        >Message from the ERgent team</Text>

                        <Text 
                        allowFontScaling={false}
                        style={{
                            color:'rgba(167,174,186,1)',
                            textAlign: 'center',
                            marginTop: 20,
                            height:82,
                            marginHorizontal : 10,
                            // backgroundColor:'yellow',
                            fontSize:14,
                            fontFamily:"Lato-Regular"
                        }}>
                            If you are requesting the immediate wait time, please call the hospital. If you are having a heart attack, stroke, or any life-threatening emergency, please call <Text style={{
                                color:'rgba(227,54,74,1)',
                                fontFamily:"Lato-Regular"
                            }}>911</Text>
                        </Text>
                        
                        <TouchableWithoutFeedback onPress={this.onClickIUnderstandOptions.bind(this)}>
                            <View style={{
                                backgroundColor: 'rgba(227,54,74,1)',
                                height:40,
                                width: Constant.DEVICE_WIDTH - 80,
                                marginTop: 10,
                                justifyContent:'center',
                                alignItems:'center',
                                marginHorizontal: 40,
                                borderRadius: 20,
                                shadowColor: 'gray',
                                shadowOpacity: 1,
                                shadowOffset: { width: 0, height: 1 },
                                elevation: 3,
                            }}>
                                <Text style={{
                                    color:'white',
                                    fontFamily:"Lato-Bold"
                                }}
                                allowFontScaling={false}>I Understand</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.onClickCall911.bind(this)}>
                            <View style={{
                                backgroundColor: 'rgba(227,54,74,1)',
                                height:40,
                                width: Constant.DEVICE_WIDTH - 80,
                                marginTop: 10,
                                justifyContent:'center',
                                alignItems:'center',
                                marginHorizontal: 40,
                                borderRadius: 20,
                                shadowColor: 'gray',
                                shadowOpacity: 1,
                                shadowOffset: { width: 0, height: 1 },
                                elevation: 3,
                            }}>
                                <Text style={{
                                    color:'white',
                                    fontFamily:"Lato-Bold"
                                }}
                                allowFontScaling={false}>Dial 911</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.onClickGoBack.bind(this)}>
                            <View style={{
                                backgroundColor: 'rgba(227,54,74,1)',
                                height:40,
                                width: Constant.DEVICE_WIDTH - 80,
                                marginTop: 10,
                                justifyContent:'center',
                                alignItems:'center',
                                marginHorizontal: 40,
                                borderRadius: 20,
                                shadowColor: 'gray',
                                shadowOpacity: 1,
                                shadowOffset: { width: 0, height: 1 },
                                elevation: 3,
                            }}>
                                <Text style={{
                                    color:'white',
                                    fontFamily:"Lato-Bold"
                                }}
                                allowFontScaling={false}>Go Back</Text>
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
                        marginTop:(Constant.DEVICE_HEIGHT-120)/2 - 185,
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
        )
    }

    onClickERgentRecommendations() {
        this.setState({
            intOptionIndex: 1,
            isShowPopupForOptions: true,
        })
    }

    onClickSearchBySymptoms() {
        this.setState({
            intOptionIndex: 2,
            isShowPopupForOptions: true,
        })
    }

    onClickSearchByLocation() {
        this.setState({
            intOptionIndex: 3,
            isShowPopupForOptions: true,
        })
    }

    onClickIUnderstandOptions() {
        this.setState({
            isShowPopupForOptions: false,
        })
        if (this.state.intOptionIndex === 1) {
            this.gotoShortestWaitTime()
        }
        else if (this.state.intOptionIndex === 2) {
            this.gotoSymtoms()
        } 
        else if (this.state.intOptionIndex === 3) {
            this.gotoSearch()
        }
    }   

    onClickCall911() {
        this.setState({
            intOptionIndex: 0,
            isShowPopupForOptions: false,
        })
        var PhoneNumber = '911'
        if (Linking.canOpenURL(`tel:${PhoneNumber}`)) {
            Linking.openURL(`tel:${PhoneNumber}`)
        }
        else{
            alert('this feature is not supported in your device')
        }
    }

    onClickGoBack() {
        this.setState({
            intOptionIndex: 0,
            isShowPopupForOptions: false,
        })
    }

    loadHowDoesERgentWorkView() {
        return(
            <Modal 
                visible={this.state.isShowPopupHowDoesERgentWork} 
                animationType={'fade'} 
                transparent={true} 
                onRequestClose={this.onModalCloseAction.bind(this)}
            >
                <View style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}> 
                    <View style={{
                        width: Constant.DEVICE_WIDTH-50,
                        height: 480,
                        backgroundColor: 'transparent',
                        // shadowColor: 'gray',
                        // shadowOpacity: 0.5,
                        // shadowOffset:{ width: 0, height: 1 },
                        // borderRadius:5,
                        alignItems:'center',
                        // overflow:'hidden',
                        // marginTop: 60,
                        overflow: 'visible',
                    }}>
                    
                    <View style={{
                        backgroundColor: 'white',
                        height:120,
                        width:120,
                        borderRadius:60,
                        // marginTop: -60,
                        justifyContent:'center',
                        alignItems:'center',
                        position: 'absolute',
                        zIndex: 1,
                        // top: -60,
                    }}>
                        <Image style={{
                            height:100,
                            width:100,
                            borderRadius:50,
                            borderWidth:1,
                            borderColor:'rgba(227,54,74,1)'
                        }}
                        source={require('../Images/logo-popup.png')}
                        />
                    </View>

                    <View style={{
                        width: Constant.DEVICE_WIDTH-50,
                        height: 420,
                        backgroundColor: 'white',
                        shadowColor: 'gray',
                        shadowOpacity: 0.5,
                        shadowOffset:{ width: 0, height: 1 },
                        borderRadius:5,
                        alignItems:'center',
                        // overflow:'hidden',
                        marginTop: 60,
                        overflow: 'visible',
                    }}>
                        <Text 
                        allowFontScaling={false}
                        style={{
                            marginTop:60,
                            fontWeight:'bold',
                            fontFamily:"Lato-Bold",
                            color:'rgba(227,54,74,1)',
                        }}>How Does ERgent Work?</Text>

                        <Text 
                        allowFontScaling={false}
                        style={{
                            // color:'rgba(167,174,186,1)',
                            color: 'gray',
                            // textAlign: 'center',
                            marginTop: 20,
                            marginHorizontal : 10,
                            fontFamily:"Lato-Regular",
                        }}>
                            <Text 
                            allowFontScaling={false}
                            style={{
                                color:'black',
                                fontFamily:"Lato-Regular"
                            }}>ERgent’s Recommendation:</Text> ERgent’s unique algorithm combines travel time with specific
                            hospital data to get you timely care anywhere across the United States. {'\n\n'}
                            <Text 
                            allowFontScaling={false}
                            style={{
                                color:'black',
                                fontFamily:"Lato-Regular"
                            }}>Symptoms:</Text> Is there something specific bothering you? ERgent’s Symptoms page will give you
                            options so you can find emergency rooms with proven success in a given field. {'\n\n'}
                            <Text 
                            allowFontScaling={false}
                            style={{
                                color:'black',
                                fontFamily:"Lato-Regular"
                            }}>Search:</Text> Do you need assistance while traveling? Is someone you care about in need? Wherever
                            you are, ERgent will help you locate a hospital – because 
                            <Text 
                            allowFontScaling={false}
                            style={{
                                color:'black',
                                fontFamily:"Lato-Regular"
                            }}> Emergencies Shouldn’t Wait.</Text>
                        </Text>
                        
                        <TouchableWithoutFeedback onPress={this.onClickERgentWorkOkay.bind(this)}>
                            <View style={{
                                backgroundColor: 'rgba(227,54,74,1)',
                                height:45,
                                width:'100%',
                                // marginTop: 20,
                                justifyContent:'center',
                                alignItems:'center',
                                borderBottomRightRadius: 5,
                                borderBottomLeftRadius: 5,
                                position: 'absolute',
                                bottom: 0,
                            }}>
                                <Text 
                                allowFontScaling={false}
                                style={{
                                    color:'white',
                                    fontFamily:"Lato-Semibold",
                                    fontWeight: 'bold',
                                }}>Okay</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        
                    </View>
                    </View>
                    
                </View>
                {/* <View style={{
                    position:'absolute',
                    backgroundColor: 'white',
                    height:120,
                    width:120,
                    zIndex:1,
                    borderRadius:60,
                    marginBottom:150,
                    marginLeft:(Constant.DEVICE_WIDTH-120)/2,
                    marginTop:(Constant.DEVICE_HEIGHT-120)/2,
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
                    />
                </View> */}
            </Modal>
        )
    }

    onClickERgentWorkOkay() {
        this.setState({
            isShowPopupHowDoesERgentWork: false
        })
    }

    onClickTellUsWhatYouThink() {
        var strURL = "http://www.ergentapp.com/feedback"
        if (Linking.canOpenURL(strURL)) {
            Linking.openURL(strURL)
        }
    }

    onClickHowDoesERgentWork() {
        this.setState({
            isShowPopupHowDoesERgentWork: true
        })
    }

    onModalCloseAction() {

    }

    onClickUnderstand() {
        if (this.state.isSelectedTC === false) {
            alert('Please accept terms and conditions')
            return false
        }
        else if (this.state.isSelectedPP === false) {
            alert('Please accept privacy policy')
            return false
        }
        else {
            AsyncStorage.setItem('isShowFirstTimePopup','1')
            this.setState({
                isShowPopup:false
            })
        }
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
        //   console.log("loadAdvertisements called")
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
    //  console.log("startCounterForNextAdvertisemet called")
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
