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
} from 'react-native';

import Constant from './GeneralClass/Constant';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

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
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            region: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            coordinate:{
                latitude: 37.78825,
                longitude: -122.4324,
            },
            placesList:[],
        };
    }

    componentDidMount() {
        // super.componentDidMount()
        this.setDummyHospital()

        this.watchID = navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Current Location:=",position)
              this.setState({
                isLoading:false,
                coordinate: { 
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
                region: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                },
            },this.getHospitalFromCurrentLocation());
            },
            (error) => console.log(error.error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },);
    }

    getHospitalFromCurrentLocation() {

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
                    }}>SEARCH</Text>

                    <Image
                        style={{
                            height:40,
                            width:40,
                            // backgroundColor:'white',
                            marginTop:15,
                            marginLeft:5,
                            opacity:0,
                        }}
                    ></Image>

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
                        marginTop: Platform.OS === 'ios' ? 74 : 64,
                        zIndex:3,
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
                            }}
                                placeholder= {'Search'}
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
                        onRegionChange={this.onRegionChange.bind(this)}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
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
                    </MapView>

                    {/* {this.state.placesList.length > 0 ?  */}
                        <View style={{
                            position:'absolute',
                            zIndex:5,
                            marginTop:80,
                            height:200,
                            backgroundColor:'yellow'
                        }}>
                        <ListView
                            contentContainerStyle={{
                                backgroundColor:'rgba(239,240,241,1)',
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
                    {/* // :
                    //     undefined
                    // } */}

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
            </View>
        )
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
        // this.setState({
        //     region: region,
        //     // coordinate: {
        //     //     latitude: region.latitude,
        //     //     longitude: region.longitude
        //     // }
        // });
    }

    onSearchClick() {
        if (this.state.searchText === '') {
          alert('Please enter text to search hospital')
          return
        }
    }

    onClearSearchClick() {
        this.setState({
            searchText:''
        })
    }

    renderRow(rowdata) {
        console.log("row data inside",rowdata);
        var imgUrl = rowdata.ImagePath;
        return ( 
            <TouchableWithoutFeedback underlayColor = {'transparent'} onPress={this.onClickListView.bind(this,rowdata)}>
                <View style = {{
                    backgroundColor:'white',
                    width:Constant.DEVICE_WIDTH-20,
                    flexDirection:'row',
                    marginHorizontal:10,
                    marginVertical:5,
                    borderRadius:3,
                    shadowColor:'gray',
                    shadowOpacity:0.3,
                    shadowOffset:{ width: 0, height: 2 },
                    height:80,
                }}>    
                    <View style={{
                        flexDirection:'column',
                        width:Constant.DEVICE_WIDTH-80,
                        justifyContent: 'flex-start',
                        height:'100%',
                    }}> 
                        <Text style={{
                            marginLeft:10,
                            marginTop:5,
                            fontSize:19,
                            color:'rgba(114,114,115,1)'
                        }}>{rowdata.name}</Text>
                        <Text style={{
                            marginLeft:10,
                            marginTop:5,
                            marginBottom:10,
                            color:'rgba(114,114,115,1)'
                        }}
                        numberOfLines={2}
                        >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</Text>
                    </View>

                    <View style={{
                        width:50,
                        height:'100%',
                        // backgroundColor:'red',
                        marginLeft:10,
                        justifyContent:'center',
                        alignItems:'center',
                        flexDirection:'column',
                    }}>
                        <Image style={{
                            height:40,
                            width:40,
                            backgroundColor:'red',
                        }}></Image>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    onClickListView(rowData) {
        console.log("rowData:=",rowData)
    }

    onClickBack() {
        navigator.geolocation.clearWatch(this.watchID);
        console.log("onClickBack")
        this.props.navigation.pop()
    }

    searchPlacesByText(strSearchText) {
        
        console.log("strSearchText:=",strSearchText)
        if (strSearchText.length > 3) {
            var strUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + strSearchText + "&key="+ "AIzaSyAPWSqlk2JrfgMQAjDOYGcJaIViPKavahg"
            let formData = new FormData();
			const config = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'json/form-data;',
				},
				body: formData,
			}
			console.log("Request RecentOtp:=",config)
			fetch(strUrl, config)
			.then((response) => response.json())
			.then((responseData) => {
                console.log("Google Places:=",responseData)		
                if (responseData.status === 'OK') {
                    // this.setState({
                    //     placesList:responseData.predictions,
                    //     dataSource:this.state.dataSource.cloneWithRows(responseData.predictions)
                    // })
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
        }

        this.setState({searchText:strSearchText})
    }
}