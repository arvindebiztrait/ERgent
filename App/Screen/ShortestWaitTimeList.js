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
  ActivityIndicator,
  NetInfo,
  StatusBar
} from 'react-native';

import Constant from './GeneralClass/Constant';
import Events from 'react-native-simple-events';
import ws from './GeneralClass/webservice';
import DeviceInfo from 'react-native-device-info';

var timerVar;

export default class ShortestWaitTimeList extends Component {

    constructor(props) {
        super(props)
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds,
            arrHospitals: [],
            searchText: '',
            isForSearch: true, //props.navigation.state.params.isForSearch,
            userLocation: props.navigation.state.params.userLocation,
            isSorting: 0,
            PageNumber: 1,
            isLoading: true,
            totalPage:0,
            isLoadmoreAvailable:true,
            isLoadMoreRunnig:true,
            isShowFooter:false,
            isVisibleAdvertise:false,
            arrAdvertisements:[],
            advertiseIndex:0,
            currentAdvertimementData: {},
            PageNumberAd:1,
            PageSizeAd: 100,
        };
    }

    componentDidMount() {
        // super.componentDidMount()
        // this.setDummyHospital()
        Events.on('receiveResponse', 'receiveSWT', this.onReceiveResponse.bind(this)) 
        this.getHospitalBySWT()

        var that = this

        clearTimeout(timerVar)

        timerVar = setTimeout(()=>{
          that.getAdvertisementList()
        }, 5000);
    }

    onReceiveResponse (responceData) { 
       
        if (responceData.MethodName == 'getHospitalBySWT') {
          console.log('responceData:=',responceData)
            this.setState({isLoading: false,isDisable:false,isLoadMoreRunnig:false,isShowFooter:false})

            this.state.totalPage = responceData.TotalPageCount
            if (this.state.PageNumber >= this.state.totalPage) {
                this.state.isLoadmoreAvailable = false
            }

            if (responceData.Status == true) {                    
                let hospitalList = responceData.Results.HospitalData;
                var totalHospital= this.state.arrHospitals.concat(hospitalList);
                var totalHospitalUnique = totalHospital.map(item => item)
                                .filter((value, index, self) => self.indexOf(value) === index)
                this.setState({
                    arrHospitals : totalHospitalUnique,
                    dataSource:this.state.dataSource.cloneWithRows(totalHospitalUnique),
                })
                
                //Uncomment for Flow Change CR
                /*
                if (this.state.PageNumber === 1) {
                    if (totalHospitalUnique.length > 0) {
                        this.props.navigation.push('searchByLocationDirection',{
                            'selectedHospital': totalHospitalUnique[0], 
                            'userLocation': this.state.userLocation,
                            'arrHospitals': totalHospitalUnique,
                        })
                    }
                }
                */
            }
            else {
                this.setState({
                    isLoading:false
                })
                alert(responceData.ErrorMessage)
            }
        }    
        else if (responceData.MethodName == 'getHospitalByHospitalId') {
            console.log("responceData:=",responceData)
        }
        else if (responceData.MethodName == 'getAdvertisementList') {
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

    getHospitalBySWT() {
        NetInfo.isConnected.fetch().then(isConnected => {
            console.log(isConnected)
            console.log('First, is ' + (isConnected ? 'online' : 'offline'));        
            if(isConnected) {
              var param = {
                  'DeviceType': Platform.OS === 'ios' ? 1 : 2,
                  'Latitude': this.state.userLocation.latitude,
                  'Longitude': this.state.userLocation.longitude,
                  'PageNumber': this.state.PageNumber,
                  'PageSize': 20,
                  'DeviceId': DeviceInfo.getUniqueID(),
                  'IsSorting': this.state.isSorting,
                  'SearchText': this.state.searchText,
              }
              console.log("param is ",param);
              this.setState({
                isLoading : true
              })
              ws.callWebservice('getHospitalBySWT',param,'')
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
                  'Latitude': this.state.userLocation.latitude,
                  'Longitude': this.state.userLocation.longitude,
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
        var strURL = ""
        if (this.state.currentAdvertimementData.ImagePath) {
          strURL = this.state.currentAdvertimementData.ImagePath
        }
        console.log("strURL:=",strURL)
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
                                // backgroundColor:'white',
                                marginTop: Platform.OS === 'ios' ? 15 : 0,
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
                        marginTop: Platform.OS === 'ios' ? 12 : 0,
                        width:Constant.DEVICE_WIDTH - 100,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        textAlign:'center',
                        fontFamily:"Lato-Bold"
                    }}>SHORTEST WAIT TIME</Text>

                    <TouchableWithoutFeedback onPress={this.onClickFilter.bind(this)}>
                        <Image
                            style={{
                                height:30,
                                width:30,
                                // backgroundColor:'white',
                                marginTop: Platform.OS === 'ios' ? 15 : 0,
                                marginLeft:5,
                            }}
                            source={require('../Images/sort.png')}
                            resizeMode={'contain'}
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
                                placeholder= {'Search for Hospital'}
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
                            paddingBottom: this.state.isVisibleAdvertise === true ? 74 : 10,
                            // backgroundColor:'yellow',
                            paddingTop: this.state.isForSearch ? 0 : 10,
                        }}
                        dataSource={this.state.dataSource}
                        renderRow={this.renderRow.bind(this)}
                        renderFooter={this.state.isShowFooter && this.state.arrHospitals.length > 0 ? this.renderFooter.bind(this) : null}
                        onScroll={this.onSrollViewEnd.bind(this)}
                        // onScrollEndDrag={this.onSrollViewEnd.bind(this)}
                        scrollEventThrottle={9000}
                        enableEmptySections={true}
                        automaticallyAdjustContentInsets={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
                { this.state.isLoading == true && this.state.PageNumber === 1 ? <ActivityIndicator
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

            </View>
        )
    }

    renderFooter() {
        return (
          <View style ={{height:50,justifyContent:'center',alignItems:'center',flexDirection:'row',backgroundColor:'rgba(227,54,74,1)'}}>
             <ActivityIndicator
                        color={'white'}
                        size={'large'}
                        hidesWhenStopped={true}
                        style={{marginLeft:20}}
                        />
             <Text style={{marginLeft:15,color:'white',fontSize:20}}>Loading...</Text>
          </View>
         )
    }

    onEndReached() {
      console.log("onEndReached")
      if(this.state.isLoadmoreAvailable == true) {
        console.log("load more available")
        if(this.state.isLoadMoreRunnig == false) {
            this.state.PageNumber = this.state.PageNumber+1
            this.setState({isLoadMoreRunnig:true,isShowFooter:true})
            this.getHospitalBySWT()
        }
      }
    }

    onSrollViewEnd(e) {
      console.log("end calleds")
      var windowHeight = Constant.DEVICE_HEIGHT,
      height = e.nativeEvent.contentSize.height,
      offset = e.nativeEvent.contentOffset.y;
      if( windowHeight + offset >= height ) {
          if(this.state.isLoadmoreAvailable == true) {
            console.log("load more available")
            if(this.state.isLoadMoreRunnig == false) {
                this.state.PageNumber = this.state.PageNumber+1
                this.setState({isLoadMoreRunnig:true,isShowFooter:true})
                this.getHospitalBySWT()
            }
          }
      }
    }

    onSearchClick() {
        if (this.state.searchText === '') {
          alert('Please enter text to search hospital')
          return
        }

        this.state.PageNumber = 1
        this.setState({
            PageNumber: 1,
            isLoading: true,
            arrHospitals: [],
            dataSource : this.state.dataSource.cloneWithRows([]),
        })
        this.getHospitalBySWT()
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
                            </View>

                            <View style={{
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
                                    >Ed. Vol. :</Text>
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

                        <View style={{
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
                        </View>

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
    }

    onClickBack() {
        console.log("onClickBack")
        this.props.navigation.pop()
    }

    onClickFilter() {
        if(this.state.isSorting === 1) {
            this.state.isSorting = 0
        }
        else {
            this.state.isSorting = 1
        }
        this.state.PageNumber = 1
        this.state.isLoading = true
        this.setState({
            arrHospitals:[],
            dataSource: this.state.dataSource.cloneWithRows([])
        })
        this.getHospitalBySWT()
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
        // this.props.navigation.push('directionScreen',{
        //     'selectedHospital': data, 
        //     'userLocation': this.state.userLocation
        //     // 'userLocation': this.state.dummyLocation
        // })
        this.getHospitalByHospitalId(data)

        this.props.navigation.push('searchByLocationDirection',{
            'selectedHospital': data, 
            'userLocation': this.state.userLocation,
            'arrHospitals': this.state.arrHospitals,
        })
    }

    //Advertisement

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
                'PageNumber': this.state.PageNumberAd,
                'PageSize': this.state.PageSizeAd,
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