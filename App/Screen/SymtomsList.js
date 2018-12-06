import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  ListView,
  NetInfo,
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';

import Constant from './GeneralClass/Constant';
import Events from 'react-native-simple-events';
import ws from './GeneralClass/webservice';
import DeviceInfo from 'react-native-device-info';
import { isIphoneX } from 'react-native-iphone-x-helper';

export default class SymtomsList extends Component {

    constructor(props) {
        super(props)
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds,
            arrSymtoms: [],
            userLocation: props.navigation.state.params.userLocation,
            PageNumber: 1,
            isLoading: true,
            totalPage:0,
            isLoadmoreAvailable:true,
            isLoadMoreRunnig:true,
            isShowFooter:false,
            PageSize:200,
        };
    }

    componentDidMount() {
        // super.componentDidMount()
        // this.setDummyHospital()
        Events.on('receiveResponse', 'receiveSymptomsList', this.onReceiveResponse.bind(this)) 
        this.getSymptomsList()
    }

    onReceiveResponse (responceData) { 
       
        if (responceData.MethodName == 'SymptomsList') {
          console.log('responceData:=',responceData)
            this.setState({isLoading: false,isDisable:false,isLoadMoreRunnig:false,isShowFooter:false})

            this.state.totalPage = responceData.TotalPageCount
            if (this.state.PageNumber >= this.state.totalPage) {
                this.state.isLoadmoreAvailable = false
            }

            if (responceData.Status == true) {                    
                let hospitalList = responceData.Results.SymptomsData;
                var totalHospital= this.state.arrSymtoms.concat(hospitalList);
                var totalHospitalUnique = totalHospital.map(item => item)
                                .filter((value, index, self) => self.indexOf(value) === index)
                this.setState({
                    arrSymtoms : totalHospitalUnique,
                    dataSource:this.state.dataSource.cloneWithRows(totalHospitalUnique),
                })
            }
            else {
                this.setState({
                    isLoading:false
                })
                alert(responceData.ErrorMessage)
            }
        }        
    }

    getSymptomsList() {
        NetInfo.isConnected.fetch().then(isConnected => {
            console.log(isConnected)
            console.log('First, is ' + (isConnected ? 'online' : 'offline'));        
            if(isConnected) {
              var param = {
                  'DeviceType': Platform.OS === 'ios' ? 1 : 2,
                  'Latitude': this.state.userLocation.latitude,
                  'Longitude': this.state.userLocation.longitude,
                  'PageNumber': this.state.PageNumber,
                  'PageSize': this.state.PageSize,
                  'DeviceId': DeviceInfo.getUniqueID(),
              }
              console.log("param is ",param);
              this.setState({
                isLoading : true
              })
              ws.callWebservice('SymptomsList',param,'')
            }
            else {
              alert(Constant.NETWORK_ALERT)
            }
        });
    }

    setDummyHospital() {
        var arr = [{'name':'Symtoms 1', 'index':'1'}, 
            {'name':'Symtoms 2', 'index':'2'},
            {'name':'Symtoms 3', 'index':'3'},
            {'name':'Symtoms 4', 'index':'4'},
            {'name':'Symtoms 5', 'index':'5'},
            {'name':'Symtoms 6', 'index':'6'}]

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
                            resizeMethod='resize'
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
                    }}>SYMPTOMS</Text>

                    <Image
                        style={{
                            height:40,
                            width:40,
                            // backgroundColor:'white',
                            marginTop:15,
                            marginLeft:5,
                        }}
                    ></Image>

                </View>

                {/* Content View */}
                <View style={{
                    height:Constant.DEVICE_HEIGHT-64,
                    // backgroundColor:'yellow',
                    width:Constant.DEVICE_WIDTH
                }}>
                    <ListView
                        contentContainerStyle={{
                            flexDirection:'row',
                            flexWrap: 'wrap',
                            backgroundColor:'rgba(242,243,245,1)',
                            paddingBottom:10,
                            paddingTop:10,
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
                    {/* <Text style={{
                        flex:1,
                        textAlign:'center',
                        textAlignVertical:'center',
                        // backgroundColor:'red',
                        justifyContent:'center',
                    }} >Under Development</Text> */}
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
            </View>
        )
    }

    renderRow(rowdata) {
        //  return this.loadSquareUI(rowdata)
         return this.loadHorizontalUI(rowdata)
     }

     loadHorizontalUI(rowdata) {
        console.log("row data inside",rowdata);
        var imgUrl = rowdata.ImagePath;
       return ( <TouchableHighlight underlayColor = {'transparent'} onPress={this.onClickListView.bind(this,rowdata)}>
                <View style = {{
                  // height:200,
                  backgroundColor:'transparent',
                  width:((Constant.DEVICE_WIDTH)),
                  flexDirection:'column',
                  // padding:10,
                  // paddingTop:0,
                  alignContent:'center',
                  alignItems:'center',
                  marginBottom:10,
                  shadowColor:'gray',
                    shadowOpacity:0.1,
                    shadowOffset:{ width: 0, height: 0.5 },
                }}>
    
                  <View style={{
                    margin:5,
                    backgroundColor:'white',
                    borderRadius:2,
                    padding:10,
                    // justifyContent:'center',
                    alignItems:'center',
                    borderWidth:1,
                    borderColor:'rgba(219,220,221,1)',
                    height:Constant.DEVICE_WIDTH/2 - 20,
                    width:Constant.DEVICE_WIDTH - 20,
                    // flexDirection: 'row'
                  }}>
                       <Image
                         style={{
                           height:Constant.DEVICE_WIDTH/2 - 80,
                           width:Constant.DEVICE_WIDTH/2 - 80,
                          //  backgroundColor:'rgba(0,165,235,1)',
                         }}
                        //  source={rowdata.index%2 == 0 ? require('Domingo/Src/images/static_img/Beauty.png') : require('Domingo/Src/images/static_img/Childcare.png')}
                        //  source={require('Domingo/Src/images/static_img/Childcare.png')}
                        //  defaultSource={require('Domingo/Src/images/placeholder_home.png')}
                         source={{ uri: imgUrl}}
                         resizeMode='contain'
                         resizeMethod='resize'
                        //  loadingIndicatorSource={require('Domingo/Src/images/placeholder_home.png')}
    
                     />
                     <Text style={{
                       fontSize:18,
                       marginTop:10,
                       marginBottom:10,
                     }}
                     numberOfLines={1}
                     >{rowdata.Name}</Text>
                  </View>
                </View>
              </TouchableHighlight>
             );
     }

     loadSquareUI(rowdata) {
        console.log("row data inside",rowdata);
        var imgUrl = rowdata.ImagePath;
        return ( <TouchableHighlight underlayColor = {'transparent'} onPress={this.onClickListView.bind(this,rowdata)}>
                <View style = {{
                  // height:200,
                  backgroundColor:'transparent',
                  width:((Constant.DEVICE_WIDTH)/2),
                  flexDirection:'column',
                  // padding:10,
                  // paddingTop:0,
                  alignContent:'center',
                  alignItems:'center',
                  marginBottom:10,
                  shadowColor:'gray',
                    shadowOpacity:0.1,
                    shadowOffset:{ width: 0, height: 0.5 },
                }}>
    
                  <View style={{
                    margin:5,
                    backgroundColor:'white',
                    borderRadius:2,
                    padding:10,
                    justifyContent:'center',
                    alignItems:'center',
                    borderWidth:1,
                    borderColor:'rgba(219,220,221,1)',
                    height:Constant.DEVICE_WIDTH/2 - 20,
                    width:Constant.DEVICE_WIDTH/2 - 20,
                  }}>
                       <Image
                         style={{
                           height:Constant.DEVICE_WIDTH/2 - 80,
                           width:Constant.DEVICE_WIDTH/2 - 80,
                          //  backgroundColor:'rgba(0,165,235,1)',
                         }}
                        //  source={rowdata.index%2 == 0 ? require('Domingo/Src/images/static_img/Beauty.png') : require('Domingo/Src/images/static_img/Childcare.png')}
                        //  source={require('Domingo/Src/images/static_img/Childcare.png')}
                        //  defaultSource={require('Domingo/Src/images/placeholder_home.png')}
                         source={{ uri: imgUrl}}
                         resizeMode='contain'
                         resizeMethod='resize'
                        //  loadingIndicatorSource={require('Domingo/Src/images/placeholder_home.png')}
    
                     />
                     <Text style={{
                       fontSize:18,
                       marginTop:10,
                       marginBottom:10,
                     }}
                     numberOfLines={1}
                     >{rowdata.Name}</Text>
                  </View>
                </View>
            </TouchableHighlight>
        );
    }

    // renderRow(rowdata) {
    //     console.log("row data inside",rowdata);
    //     var imgUrl = rowdata.ImagePath;
    //     return ( 
    //         <TouchableWithoutFeedback underlayColor = {'transparent'} onPress={this.onClickListView.bind(this,rowdata)}>
    //             <View style = {{
    //                 backgroundColor:'white',
    //                 width:Constant.DEVICE_WIDTH-20,
    //                 flexDirection:'row',
    //                 marginHorizontal:10,
    //                 marginVertical:5,
    //                 borderRadius:3,
    //                 shadowColor:'gray',
    //                 shadowOpacity:0.3,
    //                 shadowOffset:{ width: 0, height: 2 },
    //                 height:80,
    //             }}>    
    //                 <View style={{
    //                     flexDirection:'column',
    //                     width:Constant.DEVICE_WIDTH-80,
    //                     justifyContent: 'flex-start',
    //                     height:'100%',
    //                 }}> 
    //                     <Text style={{
    //                         marginLeft:10,
    //                         marginTop:5,
    //                         fontSize:19,
    //                         color:'rgba(114,114,115,1)'
    //                     }}>{rowdata.name}</Text>
    //                     <Text style={{
    //                         marginLeft:10,
    //                         marginTop:5,
    //                         marginBottom:10,
    //                         color:'rgba(114,114,115,1)'
    //                     }}
    //                     numberOfLines={2}
    //                     >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</Text>
    //                 </View>

    //                 <View style={{
    //                     width:50,
    //                     height:'100%',
    //                     // backgroundColor:'red',
    //                     marginLeft:10,
    //                     justifyContent:'center',
    //                     alignItems:'center',
    //                     flexDirection:'column',
    //                 }}>
    //                     <Image style={{
    //                         height:40,
    //                         width:40,
    //                         backgroundColor:'red',
    //                     }}></Image>
    //                 </View>
    //             </View>
    //         </TouchableWithoutFeedback>
    //     );
    // }

    onClickListView(rowData) {
        console.log("rowData:=",rowData)
        this.props.navigation.push('hospitalList', {'isForSearch':true, 'symtomsData': rowData, 'userLocation': this.state.userLocation})
    }

    onClickBack() {
        console.log("onClickBack")
        this.props.navigation.pop()
    }
}