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
  Linking,
  Alert,
} from 'react-native';

import Constant from './GeneralClass/Constant';
import { isIphoneX } from 'react-native-iphone-x-helper';

export default class MapViewListScreen extends Component {

    constructor(props) {
        super(props)
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource:ds.cloneWithRows(props.navigation.state.params.arrHospitals),
            arrHospitals:props.navigation.state.params.arrHospitals,
            userLocation:props.navigation.state.params.userLocation,
            searchText:'',
            isForSearch: false, //props.navigation.state.params.isForSearch,
        };
    }

    componentDidMount() {
        // super.componentDidMount()
        // this.setDummyHospital()
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
                                // backgroundColor:'white',
                                marginTop: isIphoneX() ? 25 : Platform.OS === 'ios' ? 15 : 0,
                                marginLeft:5,
                            }}
                            source={require('../Images/back.png')}
                            resizeMode={'center'}
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
                    }}>HOSPITAL LIST</Text>

                    <Image
                        style={{
                            height:40,
                            width:40,
                            // backgroundColor:'white',
                            marginTop: Platform.OS === 'ios' ? 15 : 0,
                            marginLeft:5,
                            opacity:0
                        }}
                        source={require('../Images/filter.png')}
                        resizeMode={'center'}
                    ></Image>

                </View>
                
                {/* SearchBar */}

                {this.state.isForSearch ? 
                    <View style={{
                        // flex:242,
                        backgroundColor:'rgba(242,243,245,1)',
                        justifyContent:'center',
                        alignItems:'center',
                        height:64,
                        // backgroundColor:'red'
                    }}>
                        <View style={{
                            // backgroundColor:'white',
                            // marginLeft:10,
                            // marginRight:10,
                            width:Constant.DEVICE_WIDTH-20,
                            height:'60%',
                            // borderRadius:20,
                            flexDirection:'row',
                            // justifyContent:'center',
                            alignItems:'center',
                            paddingLeft:15,
                            borderColor:'black',
                            borderBottomWidth:1,
                        }}>
                            <TextInput style={{
                                // borderBottomColor:'grey',
                                // borderBottomWidth:1,
                                // marginLeft:10,
                                // marginRight:10,
                                // paddingBottom:Platform.ios === 'ios' ? 0 : 5,
                                // height:Platform.ios === 'ios' ? 23 : 32,
                                width:Constant.DEVICE_WIDTH-70,
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
                                onChangeText={(text) => this.setState({searchText:text})}
                                onSubmitEditing={(event) => this.onSearchClick()}
                                // onBlur= {this.onBlurTextInput.bind(this)}
                                />
                            <TouchableWithoutFeedback style={{
                                }} onPress={this.onSearchClick.bind(this)}>
                            <Image style={{
                                position:'relative',
                                // backgroundColor:'red',
                                width:20,
                                height:'100%',
                                // marginTop:20,
                                marginLeft:10
                                }}
                                source={require('../Images/search.png')}
                                // resizeMethod='resize'
                                resizeMode='contain'
                                />
                            </TouchableWithoutFeedback>
                        </View>
                    </View>

                    :

                    undefined                
                }

                {/* Content View */}
                <View style={{
                    height: (Constant.DEVICE_HEIGHT- 64 - (this.state.isForSearch ? 64 : 0)),
                    // backgroundColor:'yellow',
                    width:Constant.DEVICE_WIDTH
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

            </View>
        )
    }

    onSearchClick() {
        if (this.state.searchText === '') {
          alert('Please enter text to search hospital')
          return
        }
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
                    elevation:4,
                    // height:80,
                }}>    
                    <View style={{
                        flexDirection:'column',
                        width:Constant.DEVICE_WIDTH-20,
                        justifyContent: 'flex-start',
                        height:'100%',
                    }}> 
                        <Text style={{
                            marginLeft:10,
                            marginTop:5,
                            fontSize:19,
                            color:'rgba(227,54,74,1)',
                            fontFamily:'Lato-Regular',
                            marginRight:5,
                        }}>{rowdata.HospitalName}</Text>

                        <View style={{
                            flexDirection:'row',
                            width:Constant.DEVICE_WIDTH-20,
                            justifyContent: 'flex-start',
                            // height:'100%',
                        }}>
                            <Text style={{
                                    marginLeft:10,
                                    marginTop:5,
                                    marginBottom:10,
                                    color:'rgba(26,26,26,1)',
                                    fontFamily:'Lato-Regular',
                                }}
                                numberOfLines={2}
                            >Door to Doctor Time :</Text>
                            <Text style={{
                                    marginLeft:5,
                                    marginTop:5,
                                    marginBottom:10,
                                    color:'rgba(137,138,139,1)',
                                    fontFamily:'Lato-Regular',
                                }}
                                numberOfLines={1}
                            >{rowdata.DoorToDoctorTimeUnweighted} min</Text>
                        </View>

                        <View style={{
                            flexDirection:'row',
                            marginTop:0,
                        }}> 
                            <View style={{
                                flexDirection:'row',
                                alignItems:'center',
                                // width:((Constant.DEVICE_WIDTH)/2),
                                borderRadius:5,
                            }}>        
                                <View style={{
                                    flexDirection:'row',
                                    justifyContent: 'flex-start',
                                }}>
                                    <Text style={{
                                            marginLeft:10,
                                            marginBottom:10,
                                            color:'rgba(26,26,26,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={1}
                                    >Travel Time :</Text>
                                    <Text style={{
                                            marginLeft:5,
                                            marginBottom:10,
                                            color:'rgba(137,138,139,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={1}
                                    >{rowdata.TravelTime.toString().replace("mins","min").replace("hour","hrs").replace("hrss","hrs")}</Text>

                                </View>
                            </View>

                            {/* <View style={{
                                flexDirection:'row',
                                alignItems:'center',
                                marginLeft:5,
                                width:((Constant.DEVICE_WIDTH-70)/2),
                                borderRadius:5,
                            }}> 
                                <View style={{
                                    flexDirection:'row',
                                    justifyContent: 'flex-start',
                                }}>
                                    <Text style={{
                                            marginLeft:10,
                                            marginBottom:10,
                                            color:'rgba(26,26,26,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={2}
                                    >ER Volume :</Text>
                                    <Text style={{
                                            marginLeft:5,
                                            marginBottom:10,
                                            color:'rgba(137,138,139,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={1}
                                    >{rowdata.EdVolume}</Text>
                                </View>
                            </View> */}
                        </View>

                        <View style={{
                            flexDirection:'row',
                            marginTop:0,
                        }}> 
                            {/* <View style={{
                                flexDirection:'row',
                                alignItems:'center',
                                width:((Constant.DEVICE_WIDTH)/2),
                                borderRadius:5,
                            }}>        
                                <View style={{
                                    flexDirection:'row',
                                    justifyContent: 'flex-start',
                                }}>
                                    <Text style={{
                                            marginLeft:10,
                                            marginBottom:10,
                                            color:'rgba(26,26,26,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={1}
                                    >Travel Time :</Text>
                                    <Text style={{
                                            marginLeft:5,
                                            marginBottom:10,
                                            color:'rgba(137,138,139,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={1}
                                    >{rowdata.TravelTime.toString().replace("mins","min").replace("hour","hrs").replace("hrss","hrs")}</Text>

                                </View>
                            </View> */}

                            <View style={{
                                flexDirection:'row',
                                alignItems:'center',
                                // marginLeft:5,
                                // width:((Constant.DEVICE_WIDTH-70)/2),
                                borderRadius:5,
                            }}> 
                                <View style={{
                                    flexDirection:'row',
                                    justifyContent: 'flex-start',
                                }}>
                                    <Text style={{
                                            marginLeft:10,
                                            marginBottom:10,
                                            color:'rgba(26,26,26,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={2}
                                    >ER Volume :</Text>
                                    <Text style={{
                                            marginLeft:5,
                                            marginBottom:10,
                                            color:'rgba(137,138,139,1)',
                                            fontFamily:'Lato-Regular',
                                        }}
                                        numberOfLines={1}
                                    >{rowdata.EdVolume}</Text>
                                </View>
                            </View>
                        </View>

                        {/* <View style={{
                            flexDirection:'row',
                            marginTop:0,
                        }}> 
                                <View style={{
                                    flexDirection:'row',
                                    alignItems:'center',
                                    width:((Constant.DEVICE_WIDTH)/2),
                                    borderRadius:5,
                                }}>     
                                    <View style={{
                                        flexDirection:'row',
                                        justifyContent: 'flex-start',
                                    }}>
                                        <Text style={{
                                                marginLeft:10,
                                                marginBottom:10,
                                                color:'rgba(26,26,26,1)',
                                                fontFamily:'Lato-Regular',
                                            }}
                                            numberOfLines={2}
                                        >{rowdata.PersonLeft}% left without being seen</Text>
                                    </View>
                                </View>

                                <View style={{
                                    flexDirection:'row',
                                    // backgroundColor:'rgba(227,54,74,1)',
                                    alignItems:'center',
                                    marginLeft:5,
                                    width:((Constant.DEVICE_WIDTH-70)/2),
                                    borderRadius:5,
                                }}> 
                                    <View style={{
                                        flexDirection:'row',
                                        justifyContent: 'flex-start',
                                        // backgroundColor:'yellow',
                                    }}>
                                        <Text style={{
                                                marginLeft:10,
                                                // marginTop:5,
                                                marginBottom:10,
                                                color:'rgba(137,138,139,1)',
                                                fontFamily:'Lato-Regular',
                                            }}
                                            numberOfLines={1}
                                        >{rowdata.HospitalDistance} Miles / {rowdata.TravelTime.toString().replace("mins","min").replace("hour","hrs").replace("hrss","hrs")}</Text>
                                    </View>
                                </View>
                        </View> */}

                        <View style={{
                            flexDirection:'row',
                            marginTop:10,
                        }}>
                            <TouchableWithoutFeedback onPress={this.onClickCallAction.bind(this, rowdata)}>
                                <View style={{
                                    flexDirection:'row',
                                    backgroundColor:'rgba(227,54,74,1)',
                                    alignItems:'center',
                                    marginLeft:10,
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
                            <TouchableWithoutFeedback onPress={this.onClickDirectionAction.bind(this, rowdata)}>
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
                                        resizeMode='center'
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
                </View>
            </TouchableWithoutFeedback>
        );
    }

    onClickListView(rowData) {
        console.log("rowData:=",rowData)
        this.props.navigation.push('directionScreen',{
            'selectedHospital':rowData, 
            'userLocation': this.state.userLocation
            // 'userLocation': this.state.dummyLocation
        })
    }

    onClickBack() {
        console.log("onClickBack")
        this.props.navigation.pop()
    }

    onClickCallAction(data) {
        var callUrl = 'tel:' + data.PhoneNumber
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

    onClickDirectionAction(data) {
        this.props.navigation.push('directionScreen',{
            'selectedHospital':data, 
            'userLocation': this.state.userLocation
            // 'userLocation': this.state.dummyLocation
        })
    }
}