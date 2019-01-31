import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  ListView,
  TextInput,
  ActivityIndicator,
  NetInfo,
  Linking,
  PermissionsAndroid,
  Alert
} from 'react-native';

import Constant from './GeneralClass/Constant';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import ws from './GeneralClass/webservice';
import Events from 'react-native-simple-events';
import Modal from 'react-native-modalbox';
import Permissions from 'react-native-permissions';
import FusedLocation from 'react-native-fused-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import DeviceInfo from 'react-native-device-info';
import { isIphoneX } from 'react-native-iphone-x-helper';

//InHouse Development Key
Geocoder.setApiKey("AIzaSyDPe5V2UvMJW_rGYpGxPPAGz4kZk7LmEOc");

export default class SearchByLocation extends Component {

    constructor(props) {
        super(props)
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            isLoading:true,
            dataSource:ds,
            arrHospitals:[],
            searchText:'',
            isForSearch: true, //props.navigation.state.params.isForSearch,
            initialRegion: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.5922,
                longitudeDelta: 0.5421,
            },
            region: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.5922,
                longitudeDelta: 0.5421,
            },
            coordinate:{
                latitude: 37.78825,
                longitude: -122.4324,
            },
            userLocation:{
                latitude: 37.78825,
                longitude: -122.4324,
            },
            dummyLocation:{
                latitude: 37.78825,
                longitude: -122.4324,
            },
            placesList:[],
            selectedAddress:{},
            selectedHospital:{},
            isUpdateRegion:false,
            isOpen: false,
            isDisabled: false,
            swipeToClose: true,
            sliderValue: 0.3,
            isOpenModal:false,
            mapType:'standard',
        };
    }

    async componentDidMount() {
        // super.componentDidMount()
        Events.on('receiveResponse', 'receiveMenuScreen', this.onReceiveResponse.bind(this)) 

        // this.setDummyHospital()

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
            console.log("android Permission")
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
            else {
                console.log("Permission granted:=",granted)
            }
        }
    }

    async getUserLocaationAndroid() {
        FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);

        // Get location once.
        const location = await FusedLocation.getFusedLocation();
        console.log("User Location Android:=",location)

        var that = this
        setTimeout(function(){

            //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
            that.state.isUpdateRegion = true
        
            }, 2000);

        this.setState({
            isLoading:false,
            coordinate: { 
                latitude: location.latitude,
                longitude: location.longitude,
            },
            userLocation: {
                latitude: location.latitude,
                longitude: location.longitude,
            },
            region: {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: this.state.region.latitudeDelta, // 0.5922,
                longitudeDelta: this.state.region.longitudeDelta, // 0.5421,
            },
        },this.getHospitalFromCurrentLocation());
    }

    getUserCurrentLocation() {
        this.watchID = navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Current Location:=",position)
                var that = this
                setTimeout(function(){
 
                    //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
                    that.state.isUpdateRegion = true
               
                  }, 2000);
              this.setState({
                isLoading:false,
                coordinate: { 
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                userLocation: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                region: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: this.state.region.latitudeDelta, // 0.5922,
                    longitudeDelta: this.state.region.longitudeDelta, // 0.5421,
                },
            },this.getHospitalFromCurrentLocation());
            },
            (error) => console.log(error.error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },);
    }

    onReceiveResponse (responceData) { 
       
        if (responceData.MethodName == 'getHospitalByLatLong') {
          console.log('responceData:=',responceData)
          this.setState({isLoading: false,isDisable:false})
          if (responceData.Status == true) {                    
            var hospitalData = responceData.Results.HospitalData     
            if (hospitalData.length > 0) {
                this.setState({
                    arrHospitals:hospitalData,
                    isLoading:false,
                    isOpenModal:true,
                    selectedHospital:hospitalData[0]
                })
            }   
            else {
                this.setState({
                    arrHospitals:hospitalData,
                    isLoading:false
                })
            }    
          }
          else {
            alert(responceData.ErrorMessage)
          }
        }     
        else if (responceData.MethodName == 'getHospitalByHospitalId') {
            console.log("responceData:=",responceData)
        }    
    }

    getHospitalFromCurrentLocation() {
        NetInfo.isConnected.fetch().then(isConnected => {
            console.log(isConnected)
            console.log('First, is ' + (isConnected ? 'online' : 'offline'));        
            if(isConnected) {
              var param = {
                  'DeviceType': Platform.OS === 'ios' ? 1 : 2,
                  'Latitude': this.state.coordinate.latitude,
                  'Longitude': this.state.coordinate.longitude,
                  'PageNumber': 1,
                  'PageSize': 20,
                  'DeviceId': DeviceInfo.getUniqueID(),
              }
              console.log("param is ",param);
              this.setState({
                isLoading : true
              })
              ws.callWebservice('getHospitalByLatLong',param,'')
            }
            else {
              alert(Constant.NETWORK_ALERT)
            }
        });
    }

    getHospitalByHospitalId(hospitalData) {
        NetInfo.isConnected.fetch().then(isConnected => {
            console.log(isConnected)
            console.log('First, is ' + (isConnected ? 'online' : 'offline'));        
            if(isConnected) {
              var param = {
                  'DeviceType': Platform.OS === 'ios' ? 1 : 2,
                  'Latitude': this.state.coordinate.latitude,
                  'Longitude': this.state.coordinate.longitude,
                  'DeviceId': DeviceInfo.getUniqueID(),
                  'HospitalId': hospitalData.HospitalsId
              }
              console.log("param is ",param);
            //   this.setState({
            //     isLoading : true
            //   })
              ws.callWebservice('getHospitalByHospitalId',param,'')
            }
            else {
              alert(Constant.NETWORK_ALERT)
            }
        });
    }

    setDummyHospital() {
        var arr = [{'name':'Hospital 1', 'index':'1'}, 
            {'name':'Hospital 2', 'index':'2'},
            {'name':'Hospital 3', 'index':'3'},
            {'name':'Hospital 4', 'index':'4'},
            {'name':'Hospital 5', 'index':'5'},
            {'name':'Hospital 6', 'index':'6'}, 
            {'name':'Hospital 7', 'index':'7'},
            {'name':'Hospital 8', 'index':'8'},
            {'name':'Hospital 9', 'index':'9'},
            {'name':'Hospital 10', 'index':'10'}]

        this.setState({
            arrHospitals:arr,
            dataSource:this.state.dataSource.cloneWithRows(arr)
        })
    }

    render() {
        return(
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
                    // justifyContent:'center',
                    alignItems:'center',
                    shadowColor:'gray',
                    shadowOpacity:1.0,
                    shadowOffset:{ width: 0, height: 2 },
                    flexDirection:'row',
                    zIndex:1,
                }}>
                    <TouchableWithoutFeedback onPress={this.onClickBack.bind(this)}>
                        <Image
                            style={{
                                height:40,
                                width:40,
                                // backgroundColor:'black',
                                marginTop: isIphoneX() ? 25 : Platform.OS === 'ios' ? 15 : 0,
                                marginLeft:0,
                            }}
                            source={require('../Images/back.png')}
                            resizeMode='center'
                        ></Image>
                    </TouchableWithoutFeedback>

                    <Text style={{
                        color:'white',
                        fontSize: 18,
                        fontWeight:'bold',
                        marginTop: isIphoneX() ? 25 : Platform.OS === 'ios' ? 12 : 0,
                        width:Constant.DEVICE_WIDTH - 100,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        textAlign:'center',
                        fontFamily:"Lato-Bold"
                    }}>SEARCH</Text>
                    <TouchableWithoutFeedback onPress={this.onClickListData.bind(this)}>
                        <Image
                            style={{
                                height:40,
                                width:40,
                                // backgroundColor:'white',
                                marginTop: isIphoneX() ? 25 : Platform.OS === 'ios' ? 15 : 0,
                                marginLeft:5,
                                // opacity:0,
                            }}
                            source={require('../Images/listview.png')}
                            resizeMode='center'
                        ></Image>
                    </TouchableWithoutFeedback>
                </View>
                
                {/* SearchBar */}

                {this.state.isForSearch ? 
                    <View style={{
                        // flex:242,
                        backgroundColor:'rgba(242,243,245,1)',
                        justifyContent:'center',
                        alignItems:'center',
                        height:44,
                        // backgroundColor:'red',
                        // marginTop:10,
                        shadowColor:'gray',
                        shadowOpacity:1.0,
                        shadowOffset:{ width: 0, height: 2 },
                        position:'absolute',
                        marginTop: isIphoneX() ? 84 : Platform.OS === 'ios' ? 74 : 64,
                        zIndex:3,
                        elevation:2
                    }}>
                        <View style={{
                            backgroundColor:'white',
                            // marginLeft:10,
                            // marginRight:10,
                            width:Constant.DEVICE_WIDTH-20,
                            height:'100%',
                            // borderRadius:20,
                            flexDirection:'row',
                            // justifyContent:'center',
                            alignItems:'center',
                            paddingLeft:5
                        }}>
                            <Image style={{
                                position:'relative',
                                // backgroundColor:'red',
                                width:20,
                                height:'44%',
                                // marginTop:20,
                                marginLeft:5
                                }}
                                // source={require('Domingo/Src/images/search.png')}
                                source={require('../Images/search_gray.png')}
                                resizeMethod='resize'
                                resizeMode='contain'
                                />

                            <TextInput style={{
                                // borderBottomColor:'grey',
                                // borderBottomWidth:1,
                                // marginLeft:10,
                                // marginRight:10,
                                // paddingBottom:Platform.ios === 'ios' ? 0 : 5,
                                // height:Platform.ios === 'ios' ? 23 : 32,
                                width:(Constant.DEVICE_WIDTH - (this.state.searchText != '' ? 90 : 110)),
                                // backgroundColor:'red',
                                height:'100%',
                                marginLeft:5,
                                fontFamily:"Lato-Regular"
                            }}
                                placeholder= {'Search by Location'}
                                allowFontScaling={false}
                                ref='bName'
                                keyboardType='default'
                                returnKeyType='done'
                                placeholderTextColor='rgba(79,90,105,1)'
                                underlineColorAndroid='transparent'
                                value={this.state.searchText}
                                autoCapitalize='none'
                                onChangeText={(text) => this.searchPlacesByText(text)}
                                onSubmitEditing={(event) => this.onSearchClick()}
                                // onFocus={(event) => this.onFocusSearchBarTextFields()}
                                multiline={false}
                                // onBlur= {this.onBlurTextInput.bind(this)}
                                />
                            {this.state.searchText != '' ? 
                                <TouchableWithoutFeedback style={{
                                    }} onPress={this.onClearSearchClick.bind(this)}>
                                <Image style={{
                                    position:'relative',
                                    // backgroundColor:'red',
                                    width:10,
                                    height:'100%',
                                    // marginTop:20,
                                    marginLeft:10,
                                    paddingHorizontal:5,
                                    }}
                                    source={require('../Images/close.png')}
                                    resizeMethod='resize'
                                    resizeMode='center'
                                    />
                                </TouchableWithoutFeedback>
                            : 
                                undefined
                            }
                        </View>
                    </View>

                    :

                    undefined                
                }
                
                

                {/* Content View */}
                <View style={{
                    height: (Constant.DEVICE_HEIGHT - (Platform.OS === 'ios' ? 64.0 : 54.0)),
                    // backgroundColor:'yellow',
                    width:Constant.DEVICE_WIDTH,
                    // backgroundColor:'red',
                }}>

                    <MapView
                        style = {{height: (Constant.DEVICE_HEIGHT - (Platform.OS === 'ios' ? 64.0 : 54.0)), width:Constant.DEVICE_WIDTH, marginRight:0, marginBottom:0, marginLeft:0, marginTop:0}}
                        region={this.state.region}
                        // onRegionChange={this.onRegionChange.bind(this)}
                        onRegionChangeComplete={this.onRegionChange.bind(this)}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
                        showsCompass={false}
                        mapType={this.state.mapType}
                        // liteMode={true}
                        // onMarkerPress={this.onMarkerClicked.bind(this)}                       
                    >
                    {/* <Marker draggable
                    coordinate={this.state.coordinate}
                    onDragEnd={(e) => this.setState({ 
                        coordinate: e.nativeEvent.coordinate,
                        region: {
                            latitude:e.nativeEvent.coordinate.latitude,
                            longitude:e.nativeEvent.coordinate.longitude,
                            latitudeDelta: this.state.region.latitudeDelta,
                            longitudeDelta: this.state.region.longitudeDelta,
                        }
                    },this.loadAddressFromMap())}
                    /> */}

                    <MapView.Marker
                        key={0}
                        // title={place.HospitalName}
                        // description={place.Address}
                        coordinate={this.state.coordinate}
                        // onMarkerPress={this.onMarkerClicked.bind(this,place)}
                        // onPress={this.onMarkerClicked.bind(this,place)}
                        // omMarkerPress={this.testRoutesStatic.bind(this)}
                        // onPress={this.testRoutesStatic.bind(this)}
                        >
                        {/* <Image
                            source={require('../Images/clinic.png')}
                            style={{
                                height:40,
                                width:40,
                            }}
                        /> */}
                        </MapView.Marker>

                    {this.state.arrHospitals.map((place, index) => (
                        <MapView.Marker
                        key={index}
                        // title={place.HospitalName}
                        // description={place.Address}
                        coordinate={{ 
                            latitude: parseFloat(place.Latitude),
                            longitude: parseFloat(place.Longitude) 
                        }}
                        onMarkerPress={this.onMarkerClicked.bind(this,place)}
                        onPress={this.onMarkerClicked.bind(this,place)}
                        image={require('../Images/hospital_icon_new.png')}
                        >
                        {console.log("Log ===> Marker")}
                        {/* {Platform.OS === 'ios' ? 
                            <Image
                                source={require('../Images/hospital_icon_new.png')}
                                style={{
                                    height:40,
                                    width:40,
                                }}
                                resizeMode={'contain'}
                            />
                            :
                            <Image
                                // onLoad={() => this.forceUpdate()}
                                // onLayout={() => this.forceUpdate()}
                                source={require('../Images/hospital_icon_new.png')}
                                style={{
                                    height:40,
                                    width:40,
                                }}
                                resizeMode={'center'}
                            />
                        } */}
                        </MapView.Marker>
                    ))}
                    </MapView>

                    

                </View>
                { this.state.isLoading == true ? <ActivityIndicator
                    color={'rgba(227,54,74,1)'}    //rgba(254,130,1,0.5)'
                    size={'large'}
                    style={{
                        height:'10%',
                        width:'20%',
                        position:'absolute',
                        left:'40%',
                        top:'45%',
                        justifyContent:'center',
                    }}
                    />: null
                }

                    <View style={{
                        backgroundColor:'white',
                        flexDirection:'row',
                        position:'absolute',
                        zIndex:5,
                        // marginBottom:320,
                        // marginRight:30,
                        marginTop: (Constant.DEVICE_HEIGHT - (this.state.isOpenModal ? ( Platform.OS === 'ios' ? 330 : 350) :  Platform.OS === 'ios' ? 50 : 70)),
                        marginLeft: Constant.DEVICE_WIDTH - 130,
                        shadowColor:'gray',
                        shadowOpacity:1.0,
                        shadowOffset:{ width: 0, height: 2 },
                        borderRadius:3,
                        alignSelf:'flex-start',
                        elevation:5,
                    }}>
                        <TouchableWithoutFeedback onPress={this.onClickMapAction.bind(this)}>
                            <View style={{
                                height:30,
                                width:60,
                                justifyContent:'center',
                                alignItems:'center',
                                borderRightWidth:1,
                                borderColor:'gray',
                            }}>
                                <Text style={{
                                    fontFamily:"Lato-Regular"
                                }}>Map</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.onClickSateliteAction.bind(this)}>
                            <View style={{
                                height:30,
                                width:60,
                                justifyContent:'center',
                                alignItems:'center'
                            }}>
                                <Text style={{
                                    fontFamily:"Lato-Regular"
                                }}>Satellite</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                
                {this.loadAddressDetailView()}

                {this.state.placesList.length > 0 ? 
                        <View style={{
                            position:'absolute',
                            zIndex:5,
                            marginTop:(60 + (Platform.OS === 'ios' ? (isIphoneX() ? 74 : 64) : 54)),
                            height:200,
                            // backgroundColor:'yellow',
                            marginHorizontal:10,
                            shadowColor:'gray',
                            shadowOpacity:1.0,
                            shadowOffset:{ width: 0, height: 2 },
                        }}>
                        <ListView
                            contentContainerStyle={{
                                // backgroundColor:'rgba(239,240,241,1)',
                                paddingBottom:10,
                                // backgroundColor:'yellow',
                                paddingTop: this.state.isForSearch ? 0 : 10,
                                
                            }}
                            dataSource={this.state.dataSource}
                            renderRow={this.renderRow.bind(this)}
                            // renderFooter={this.state.isShowFooter ? this.renderFooter.bind(this) : null}
                            // onScroll={this.onSrollViewEnd.bind(this)}
                            // scrollEventThrottle={9000}
                            enableEmptySections={true}
                            automaticallyAdjustContentInsets={false}
                            showsVerticalScrollIndicator={false}
                        />
                        </View>
                    :
                        undefined
                    }
            </View>
        )
    }

    onClickMapAction() {
        this.setState({
            mapType:'standard'
        })
    }

    onClickSateliteAction() {
        this.setState({
            mapType:'satellite'
        })
    }

    loadAddressDetailView() {
        return (
            <Modal style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 280,
                // backgroundColor: 'transparent'
            }} 
            position={"bottom"} 
            ref={"modal6"} 
            swipeArea={20}
            isOpen={this.state.isOpenModal}            
            onOpened={this.onOpen.bind(this)}
            onClosed={this.onClose.bind(this)}
            onClosingState={this.onClosingState.bind(this)}
            backdropColor={'transparent'}
            backdrop={false}
            >
            
            {/* <ScrollView> */}
                <View style={{
                    width: Constant.DEVICE_WIDTH, 
                    height:280, 
                    // paddingLeft: 10, 
                    backgroundColor:'transparent', 
                    // borderTopWidth:1,
                }}>
                    <View style={{
                        backgroundColor:'rgba(227,54,74,1)',
                        // height:125,
                        width:'100%',
                        paddingBottom:10,
                    }}>
                        <Text style={{
                            color:'white',
                            marginHorizontal:30,
                            marginTop:10,
                            fontSize:17,
                            fontFamily:"Lato-Regular"
                        }}
                        numberOfLines={2}
                        >{this.state.selectedHospital.HospitalName}</Text>
                        <View style={{
                            flexDirection:'row',
                            marginHorizontal:30,
                            // backgroundColor:'yellow',
                            marginTop:10,
                        }}>
                            <Image
                                style={{
                                    height:25,
                                    width:25,
                                    // backgroundColor:'black',
                                    // marginTop: 5,
                                    marginLeft:0,
                                }}
                                source={require('../Images/location_white.png')}
                                resizeMode='center'
                            ></Image>
                            <View style={{
                                // backgroundColor:'green',
                                marginLeft:10,
                            }}>
                            <Text style={{
                                color:'white',
                                fontSize:12,
                                fontFamily:"Lato-Regular"
                            }}>{this.state.selectedHospital.Address}</Text>
                            <Text style={{
                                color:'white',
                                fontSize:12,
                                fontFamily:"Lato-Regular"
                            }}>{this.state.selectedHospital.City + ", " + this.state.selectedHospital.State + " " + this.state.selectedHospital.ZIPCode}</Text>
                            {/* <Text style={{
                                color:'white',
                                fontSize:12,
                                fontFamily:"Lato-Regular"
                            }}>{this.state.selectedHospital.State + " " + this.state.selectedHospital.ZIPCode}</Text> */}
                        </View>
                    </View>
                </View>

                <View style={{
                    backgroundColor:'white',
                }}>
                        <View style={{
                            flexDirection:'row',
                            marginHorizontal:30,
                            // justifyContent:'center',
                            alignItems:'center',
                            marginTop:10,
                        }}>
                            <Image
                                style={{
                                    height:25,
                                    width:25,
                                    // backgroundColor:'black',
                                    // marginTop: 5,
                                    marginLeft:0,
                                }}
                                source={require('../Images/car.png')}
                                resizeMode='center'
                            ></Image>

                            <Text style={{
                                color:'rgba(100,101,101,1)',
                                fontSize:13,
                                marginLeft:10,
                                fontFamily:"Lato-Regular"
                            }}>{"Door to Doctor : " + this.state.selectedHospital.DoorToDoctorTimeUnweighted + " min"}</Text>
                        </View>

                        <View style={{
                            flexDirection:'row',
                            marginHorizontal:30,
                            // justifyContent:'center',
                            alignItems:'center',
                            marginTop:10,
                        }}>
                            <Image
                                style={{
                                    height:25,
                                    width:25,
                                    // backgroundColor:'black',
                                    // marginTop: 5,
                                    marginLeft:0,
                                }}
                                source={require('../Images/car.png')}
                                resizeMode='center'
                            ></Image>

                            <Text style={{
                                color:'rgba(100,101,101,1)',
                                fontSize:13,
                                marginLeft:10,
                                fontFamily:"Lato-Regular"
                            }}>{"Drive to Hospital : " + ("TravelTime" in this.state.selectedHospital ? this.state.selectedHospital.TravelTime.toString().replace("mins","min").replace("hour","hrs").replace("hrss","hrs") : "")}</Text>
                        </View>

                        <View style={{
                            flexDirection:'row',
                            marginHorizontal:30,
                            // justifyContent:'center',
                            alignItems:'center',
                            marginTop:10,
                            marginBottom:10,
                        }}>
                            <Image
                                style={{
                                    height:25,
                                    width:25,
                                    // backgroundColor:'black',
                                    // marginTop: 5,
                                    marginLeft:0,
                                }}
                                source={require('../Images/emergency.png')}
                                resizeMode='center'
                            ></Image>

                            <Text style={{
                                color:'rgba(100,101,101,1)',
                                fontSize:13,
                                marginLeft:10,
                                fontFamily:"Lato-Regular"
                            }}>{"Emergency Volume : " + this.state.selectedHospital.EdVolume}</Text>
                        </View>

                        <View style={{
                            height:1,
                            backgroundColor:'rgba(232,232,233,1)',
                            marginHorizontal:15,
                        }}></View>

                        <View style={{
                            flexDirection:'row',
                            marginTop:10,
                        }}>
                            <TouchableWithoutFeedback onPress={this.onClickCallAction.bind(this)}>
                                <View style={{
                                    flexDirection:'row',
                                    backgroundColor:'rgba(227,54,74,1)',
                                    alignItems:'center',
                                    marginLeft:20,
                                    width:((Constant.DEVICE_WIDTH-60)/2),
                                    height:40,
                                    justifyContent:'center',
                                    borderRadius:5,
                                    marginBottom:15,
                                }}>
                                    <Image
                                        style={{
                                            height:25,
                                            width:25,
                                            // backgroundColor:'black',
                                            // marginTop: 5,
                                            marginLeft:0,
                                        }}
                                        source={require('../Images/call.png')}
                                        resizeMode='center'
                                    ></Image>
                                    
                                    <Text style={{
                                        color:'white',
                                        marginLeft:10,
                                        fontFamily:"Lato-Regular"
                                    }} >Call</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.onClickDirectionAction.bind(this)}>
                                <View style={{
                                    flexDirection:'row',
                                    backgroundColor:'rgba(227,54,74,1)',
                                    alignItems:'center',
                                    marginLeft:20,
                                    width:((Constant.DEVICE_WIDTH-60)/2),
                                    height:40,
                                    justifyContent:'center',
                                    borderRadius:5,
                                }}>
                                    <Image
                                        style={{
                                            height:25,
                                            width:25,
                                            // backgroundColor:'black',
                                            // marginTop: 5,
                                            marginLeft:0,
                                        }}
                                        source={require('../Images/direction.png')}
                                        resizeMode='contain'
                                    ></Image>
                                    
                                    <Text style={{
                                        color:'white',
                                        marginLeft:10,
                                        fontFamily:"Lato-Regular"
                                    }} >Directions</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                    </View>
                
                {/* {this.renderList()} */}
                </View>
            {/* </ScrollView> */}
            </Modal>
        )
    }

    onClickDirectionAction() {
        console.log("Pass this.state.userLocation:=",this.state.userLocation)
        console.log("Pass this.state.coordinate:=",this.state.coordinate)
        this.props.navigation.push('directionScreen',{
            'selectedHospital':this.state.selectedHospital, 
            'userLocation': this.state.coordinate //this.state.userLocation
            // 'userLocation': this.state.dummyLocation
        })        
        // this.testRoutes()
        this.getHospitalByHospitalId(this.state.selectedHospital)
    }

    testRoutes() {
        var url = ""
        if (Platform.OS === 'ios') {
            // url = "http://maps.apple.com/?ll="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
            // url = "maps://app?ll="+this.state.userLocation.latitude+"," + this.state.userLocation.longitude+"&"+"ll="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
            // url = "http://maps.apple.com/?saddr="+this.state.userLocation.latitude+"," + this.state.userLocation.longitude+"&daddr="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
            url = "http://maps.apple.com/?daddr="+this.state.selectedHospital.Discription
        }
        else {
            // url = "geo:"+ this.state.selectedHospital.Latitude + "," + this.state.selectedHospital.Longitude,
            // url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination="+"23.2156,72.6369" //test
            url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
        }         

        console.log("this.state.selectedHospital:=",this.state.selectedHospital)
        console.log("url:=",url)
        if (Linking.canOpenURL(url)) {
            Linking.openURL(url)
        }
        else {
            alert("You can't see route in another application because application is not install")
        }
    }

    testRoutesStatic() {
        var url = ""
        if (Platform.OS === 'ios') {
            url = "http://maps.apple.com/?ll="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
            // url = "maps://app?saddr="+this.state.userLocation.latitude+"," + this.state.userLocation.longitude+"&"+"ll="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
            url = "http://maps.apple.com/?saddr="+this.state.userLocation.latitude+"," + this.state.userLocation.longitude+"&daddr="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
            url = "http://maps.apple.com/?daddr="+this.state.selectedHospital.Discription
        }
        else {
            // url = "geo:"+ 23.2464 + "," + 72.5087
            // url = "geo:23.2464,72.5087"
            // url = "geo:saddr="+this.state.userLocation.latitude+"," + this.state.userLocation.longitude+"&daddr="+this.state.selectedHospital.Latitude+"," + this.state.selectedHospital.Longitude
            url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination="+"23.2156,72.6369"
        }         

        console.log("this.state.selectedHospital:=",this.state.selectedHospital)
        console.log("url:=",url)
        if (Linking.canOpenURL(url)) {
            Linking.openURL(url)
        }
        else {
            alert("You can't see route in another application because application is not install")
        }
    }

    onClickCallAction() {
        var callUrl = 'tel:' + this.state.selectedHospital.PhoneNumber
        console.log('call:=',callUrl)
        Linking.canOpenURL(callUrl).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + callUrl);
                alert('This feature is not supported by device')
            } else {
                return Linking.openURL(callUrl);
            }
        }).catch(err => alert(err));
    }

    onClose() {
        this.setState({
            isOpenModal:false
        })
        console.log('Modal just closed');
    }
    
    onOpen() {
        console.log('Modal just openned');
    }

    onClosingState(state) {
        console.log('the open/close of the swipeToClose just changed');
    }

    onMarkerClicked(param) {
        console.log("onMarkerClicked:=",param)
        this.setState({
            isOpenModal:true,
            selectedHospital:param
        })
    }

    loadAddressFromMap() {
        console.log("loadAddressFromMap called")
        // this.setState({
        //   isShowHudForAddress:true,
        // })
        // Geocoder.getFromLatLng(this.state.coordinate.latitude, this.state.coordinate.longitude).then(
        //   json => {
        //       console.log("json.results[0]:=",json.results[0])
        //       console.log("json.results[0].formatted_address:=",json.results[0].formatted_address)
        //       this.setState({
        //         fullAddress:json.results[0].formatted_address,
        //         isShowHudForAddress:false,
        //       })
        //       var address_component = json.results[0].address_components;
        //       for (let index = 0; index < address_component.length; index++) {
        //           const element = address_component[index];
        //           if (element.types.includes('street_number')) {
        //               console.log("street_number matched")
        //               this.setState({
        //                   block_no:element.long_name
        //               });
        //           }
        //           else if (element.types.includes('route') || element.types.includes('neighborhood') || element.types.includes('sublocality_level_1')) {
        //             this.setState({
        //                 areaName: element.long_name
        //             });
        //           }
        //           else if (element.types.includes('locality')) {
        //               this.setState({
        //                   city: element.long_name
        //               });
        //           }
        //           else if (element.types.includes('administrative_area_level_1')) {
        //               this.setState({
        //                   street:element.long_name
        //               })
        //           }
        //           else if (element.types.includes('country')) {
        //               this.setState({
        //                 country:element.long_name
        //               })
        //           }
        //           else if (element.types.includes('postal_code')) {
        //             this.setState({
        //                 zipCode:element.long_name
        //             })
        //         }
        //       }
        //       console.log("address_component:=",address_component[0].types[0])
        //       console.log("locality:=",json.results[0].address_components.locality)
        //   },
        //   error => {
        //       console.log("ERROR:=",error)
        //       alert("Error to get address from lat-long:",error)
        //       this.setState({
        //         isShowHudForAddress:false
        //       })
        //   }
        // );
    }

    onRegionChange(region) {
        // this.setState({ region:region });
        console.log("region:=",region)
        if (this.state.isUpdateRegion === true) {

            var regionNew = {
                latitude: region.latitude,
                longitude: region.longitude,
                latitudeDelta: 0.05922,
                longitudeDelta: 0.05421,
            }

            this.setState({
                region: region,
                // coordinate: {
                //     latitude: region.latitude,
                //     longitude: region.longitude
                // }
            });
        }
    }

    onFocusSearchBarTextFields() {
        
        if (this.state.isOpenModal === true) {
            this.state.isOpenModal = false
            this.setState({
                isOpenModal: false
            },this.refs['modal6'].close())
            // this.refs.bName.focus()
            this.refs['bName'].focus()
        }
    }

    onSearchClick() {
        if (this.state.searchText.trim() === '') {
          alert('Please enter text to search hospital')
          return
        }
    }

    onClearSearchClick() {
        this.setState({
            searchText:'',
            placesList:[],
        })
    }

    renderRow(rowdata) {
        console.log("row data inside",rowdata);
        // var imgUrl = rowdata.ImagePath;
        return ( 
            <TouchableWithoutFeedback underlayColor = {'transparent'} onPress={this.onClickListView.bind(this,rowdata)}>
                <View style = {{
                    backgroundColor:'white',
                    width:Constant.DEVICE_WIDTH-20,
                    flexDirection:'row',
                    marginVertical:1,
                    borderRadius:3,
                    shadowColor:'gray',
                    shadowOpacity:0.3,
                    shadowOffset:{ width: 0, height: 2 },
                    paddingVertical:5,
                    elevation:3
                }}>    
                    <Text style={{
                        marginLeft:10,
                        // marginTop:5,
                        fontSize:13,
                        color:'rgba(114,114,115,1)',
                        paddingVertical:5,
                    }}>{rowdata.description}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    onClickListView(rowData) {
        console.log("rowData:=???",rowData)
        this.setState({
            selectedAddress:rowData,
            isLoading:true,
            placesList:[],
            searchText:rowData.description,
            arrHospitals: [],
            isOpenModal : false
        })
        this.getLatLongFromAddressFun(rowData)
    }

    onClickBack() {
        navigator.geolocation.clearWatch(this.watchID);
        console.log("onClickBack")
        this.props.navigation.pop()
    }

    onClickListData() {
        if(this.state.arrHospitals.length > 0) {
            this.props.navigation.push('mapViewListScreen',{
                'arrHospitals':this.state.arrHospitals, 
                'userLocation': this.state.coordinate //this.state.userLocation
                // 'userLocation': this.state.dummyLocation
            })
        }
        else {
            alert('Data not available')
        }
    }

    searchPlacesByText(strSearchText) {
        
        console.log("strSearchText:=",strSearchText)
        // this.state.isOpenModal = false
        // this.refs['modal6'].close()
        this.setState({
            searchText : strSearchText,
            // isOpenModal : false,
        })
        if (strSearchText.trim().length > 3) {
            
            this.setState({
                isLoading : true,
            })
            var strUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + strSearchText + "&key="+ "AIzaSyDPe5V2UvMJW_rGYpGxPPAGz4kZk7LmEOc"
            let formData = new FormData();
			const config = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json;',
				},
				// body: formData,
			}
            console.log("Request RecentOtp:=",config)
            console.log("URL:=",strUrl)
			fetch(strUrl, config)
			.then((response) => response.json())
			.then((responseData) => {
                console.log("Google Places:=",responseData)		
                if (responseData.status === 'OK') {
                    this.setState({
                        placesList:responseData.predictions,
                        dataSource:this.state.dataSource.cloneWithRows(responseData.predictions),
                        isLoading: false,
                    })
                }
                else {
                    console.log("Google Places:= error in response , ",error);
                }
			})
			.catch((error) => {
				console.log("Google Places:= error, ",error);
			})
			.done();
        }
        else {
            console.log("Less Than 3 character")
            if (strSearchText === '' || strSearchText.length === 0) {
                this.setState({
                    placesList:[],
                    isLoading:false
                })
            }
        }
    }

    getLatLongFromAddressFun(rowData) {
        console.log("getLatLongFromAddress called")
        Geocoder.getFromLocation(rowData.description).then(
            json => {
                console.log("json:=",json)
                if (json.results.length > 0) {
                    var geometry = json.results[0].geometry
                    console.log("Latitude:=",geometry.location.lat, "Longitude:=", geometry.location.lng)
                    this.setState({
                        isLoading:false,
                        coordinate:{
                            latitude:geometry.location.lat,
                            longitude:geometry.location.lng
                        },
                        region:{
                            latitude:geometry.location.lat,
                            longitude:geometry.location.lng,
                            latitudeDelta: this.state.region.latitudeDelta, // 0.5922,
                            longitudeDelta: this.state.region.longitudeDelta, // 0.5421,
                        }
                    },this.getHospitalFromCurrentLocation())
                }
                else {
                    alert("Latitude/Longitude not found")
                }
                // console.log("json.results[0]:=",json.results[0])
                // console.log("json.results[0].formatted_address:=",json.results[0].formatted_address)
                // this.setState({
                //   fullAddress:json.results[0].formatted_address,
                //   isShowHudForAddress:false,
                // })
                // var address_component = json.results[0].address_components;
                // for (let index = 0; index < address_component.length; index++) {
                //     const element = address_component[index];
                //     if (element.types.includes('street_number')) {
                //         console.log("street_number matched")
                //         this.setState({
                //             block_no:element.long_name
                //         });
                //     }
                //     else if (element.types.includes('route') || element.types.includes('neighborhood') || element.types.includes('sublocality_level_1')) {
                //       this.setState({
                //           areaName: element.long_name
                //       });
                //     }
                //     else if (element.types.includes('locality')) {
                //         this.setState({
                //             city: element.long_name
                //         });
                //     }
                //     else if (element.types.includes('administrative_area_level_1')) {
                //         this.setState({
                //             street:element.long_name
                //         })
                //     }
                //     else if (element.types.includes('country')) {
                //         this.setState({
                //           country:element.long_name
                //         })
                //     }
                //     else if (element.types.includes('postal_code')) {
                //       this.setState({
                //           zipCode:element.long_name
                //       })
                //   }
                // }
                // console.log("address_component:=",address_component[0].types[0])
                // console.log("locality:=",json.results[0].address_components.locality)
            },
            error => {
                console.log("ERROR:=",error)
                alert("Error to get address from lat-long:",error)
                this.setState({
                  isShowHudForAddress:false
                })
            }
          );
    }
}