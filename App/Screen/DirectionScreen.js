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
} from 'react-native';

import Constant from './GeneralClass/Constant';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import ws from './GeneralClass/webservice';
import Events from 'react-native-simple-events';
import Modal from 'react-native-modalbox';

//InHouse Development Key
Geocoder.setApiKey('AIzaSyAPWSqlk2JrfgMQAjDOYGcJaIViPKavahg');

export default class DirectionScreen extends Component {

    constructor(props) {
        super(props)
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            isLoading:false,
            dataSource:ds,
            arrHospitals:[],
            searchText:'',
            isForSearch: true, //props.navigation.state.params.isForSearch,
            initialRegion: {
                latitude: props.navigation.state.params.userLocation ? props.navigation.state.params.userLocation.latitude : 37.78825,
                longitude: props.navigation.state.params.userLocation ? props.navigation.state.params.userLocation.longitude : -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            region: {
                latitude: props.navigation.state.params.userLocation ? props.navigation.state.params.userLocation.latitude : 37.78825,
                longitude: props.navigation.state.params.userLocation ? props.navigation.state.params.userLocation.longitude : -122.4324,
                latitudeDelta: 0.00522, //0.5922,
                longitudeDelta: 0.00221, //0.5421,
            },
            coordinate:{
                latitude:  props.navigation.state.params.userLocation ? props.navigation.state.params.userLocation.latitude : 37.78825,
                longitude: props.navigation.state.params.userLocation ? props.navigation.state.params.userLocation.longitude : -122.4324,
            },
            userLocation: props.navigation.state.params.userLocation ? props.navigation.state.params.userLocation : {
                latitude: 37.78825,
                longitude: -122.4324,
            },
            placesList:[],
            selectedAddress:{},
            selectedHospital: props.navigation.state.params.selectedHospital ? props.navigation.state.params.selectedHospital : {},
            isUpdateRegion:false,
            isOpen: false,
            isDisabled: false,
            swipeToClose: true,
            sliderValue: 0.3,
            isOpenModal:false,
            mapType:'standard',
        };
    }

    componentDidMount() {
        var that = this
        setTimeout(function(){
            //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
            that.state.isUpdateRegion = true        
        }, 2000);
    }

    onReceiveResponse (responceData) {        
             
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
                    height: Platform.OS === 'ios' ? 64 : 54,
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
                                marginTop: Platform.OS === 'ios' ? 15 : 0,
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
                        marginTop: Platform.OS === 'ios' ? 12 : 0,
                        width:Constant.DEVICE_WIDTH - 100,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        textAlign:'center',
                        fontFamily:"Lato-Regular"
                    }}>DIRECTIONS</Text>
                    <TouchableWithoutFeedback onPress={this.onClickExternalDirection.bind(this)}>
                        <Image
                            style={{
                                height:40,
                                width:40,
                                // backgroundColor:'white',
                                marginTop: Platform.OS === 'ios' ? 15 : 0,
                                marginLeft:5,
                                // opacity:0,
                            }}
                            source={require('../Images/direction.png')}
                            resizeMode='center'
                        ></Image>
                    </TouchableWithoutFeedback>
                </View>        
                

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
                        onRegionChange={this.onRegionChange.bind(this)}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
                        showsCompass={false}
                        mapType={this.state.mapType}   
                        // liteMode={true}   
                    >

                    {/* {this.state.arrHospitals.map((place, index) => (
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
                        />
                    ))} */}

                    <MapView.Marker
                        key={0}
                        title={'User Location'}
                        // description={place.Address}
                        coordinate={this.state.userLocation}
                        // onMarkerPress={this.onMarkerClicked.bind(this,place)}
                        // onPress={this.onMarkerClicked.bind(this,place)}
                        pinColor={'green'}
                    />

                    <MapView.Marker
                        key={1}
                        title={this.state.selectedHospital.HospitalName}
                        // description={place.Address}
                        coordinate={{ 
                            latitude: parseFloat(this.state.selectedHospital.Latitude),
                            longitude: parseFloat(this.state.selectedHospital.Longitude) 
                        }}
                        // onMarkerPress={this.onMarkerClicked.bind(this,place)}
                        // onPress={this.onMarkerClicked.bind(this,place)}
                    />

                    <MapViewDirections
                        origin={this.state.userLocation}
                        waypoints={null}
                        destination={{
                            latitude: parseFloat(this.state.selectedHospital.Latitude),
                            longitude: parseFloat(this.state.selectedHospital.Longitude),
                        }}
                        apikey={'AIzaSyAPWSqlk2JrfgMQAjDOYGcJaIViPKavahg'}
                        strokeWidth={5}
                        strokeColor="blue"
                        onStart={(params) => {
                            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                        }}
                        // onReady={(result) => {
                            //   this.mapView.fitToCoordinates(result.coordinates, {
                            //     edgePadding: {
                            //       right: (width / 20),
                            //       bottom: (height / 20),
                            //       left: (width / 20),
                            //       top: (height / 20),
                            //     }
                            //   });
                            // }}
                        onError={(errorMessage) => {
                            // console.log('GOT AN ERROR');
                            console.log("direction errorMessage:=",errorMessage)
                        }}
                    />

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
                        marginTop: (Constant.DEVICE_HEIGHT - (this.state.isOpenModal ? ( Platform.OS === 'ios' ? 350 : 370) :  Platform.OS === 'ios' ? 50 : 70)),
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

    onMarkerClicked(param) {
        console.log("onMarkerClicked:=",param)
        // this.setState({
        //     isOpenModal:true,
        //     selectedHospital:param
        // })
    }

    onRegionChange(region) {
        // this.setState({ region:region });
        console.log("region:=",region)
        if (this.state.isUpdateRegion === true) {
            this.setState({
                region: region,
                // coordinate: {
                //     latitude: region.latitude,
                //     longitude: region.longitude
                // }
            });
        }
    }

    onSearchClick() {
        if (this.state.searchText === '') {
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

    onClickBack() {
        navigator.geolocation.clearWatch(this.watchID);
        console.log("onClickBack")
        this.props.navigation.pop()
    }

    onClickExternalDirection() {
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
}