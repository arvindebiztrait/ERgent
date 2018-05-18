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
} from 'react-native';

import Constant from './GeneralClass/Constant';

export default class HospitalList extends Component {

    constructor(props) {
        super(props)
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource:ds,
            arrHospitals:[],
            searchText:'',
            isForSearch:props.navigation.state.params.isForSearch,
        };
    }

    componentDidMount() {
        // super.componentDidMount()
        this.setDummyHospital()
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
                    height:64,
                    backgroundColor:'rgba(227,54,74,1)',
                    width:'100%',
                    justifyContent:'center',
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
                                backgroundColor:'white',
                                marginTop:15,
                                marginLeft:5,
                            }}
                            source={require('../Images/back.png')}
                        ></Image>
                    </TouchableWithoutFeedback>

                    <Text style={{
                        color:'white',
                        fontSize: 18,
                        fontWeight:'bold',
                        marginTop: Platform.OS === 'ios' ? 12 : 12,
                        width:Constant.DEVICE_WIDTH - 100,
                        marginLeft: 5,
                        // backgroundColor:'yellow',
                        textAlign:'center',
                    }}>Hospitals</Text>

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
                
                {/* SearchBar */}

                {this.state.isForSearch ? 
                    <View style={{
                        // flex:242,
                        backgroundColor:'rgba(242,243,245,1)',
                        justifyContent:'center',
                        alignItems:'center',
                        height:64,
                    }}>
                        <View style={{
                            backgroundColor:'white',
                            // marginLeft:10,
                            // marginRight:10,
                            width:'90%',
                            height:'60%',
                            borderRadius:20,
                            flexDirection:'row',
                            // justifyContent:'center',
                            alignItems:'center',
                            paddingLeft:15
                        }}>
                            <TextInput style={{
                                // borderBottomColor:'grey',
                                // borderBottomWidth:1,
                                // marginLeft:10,
                                // marginRight:10,
                                // paddingBottom:Platform.ios === 'ios' ? 0 : 5,
                                // height:Platform.ios === 'ios' ? 23 : 32,
                                width:'80%'
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
                                backgroundColor:'red',
                                width:40,
                                height:'100%',
                                // marginTop:20,
                                marginLeft:10
                                }}
                                // source={require('Domingo/Src/images/search.png')}
                                resizeMethod='resize'
                                resizeMode='center'
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
        console.log("onClickBack")
        this.props.navigation.pop()
    }
}