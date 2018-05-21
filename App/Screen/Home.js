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
} from 'react-native';

import Constant from './GeneralClass/Constant';

export default class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isShowPopup:false
        };
    }

    componentDidMount() {
        this.setState({
            isShowPopup:true
        })
    }

    render() {
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
            }}>

                <Text style={{
                    color:'white',
                    fontSize: 18,
                    fontWeight:'bold',
                    marginTop: Platform.OS === 'ios' ? 12 : 0,
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
                    width:70,
                    borderColor:'rgba(218,219,220,1)',
                }}></View>
                <Text style={{
                    fontSize:16,
                    fontWeight: 'bold',
                    // backgroundColor:'yellow',
                    marginHorizontal:10,
                }}>How Can We Help? </Text>
                <View style={{
                    borderWidth:0.5,
                    width:70,
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
                    color:'rgba(114,114,115,1)'
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
                    color:'rgba(114,114,115,1)'
                }}>Symtoms</Text>

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
                    color:'rgba(114,114,115,1)'
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
                            color:'rgba(114,114,115,1)'
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
                            color:'rgba(114,114,115,1)'
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
                        }}>Message from the ERgent team</Text>

                        <Text style={{
                            color:'rgba(167,174,186,1)',
                            textAlign: 'center',
                            marginTop: 20,
                            marginHorizontal : 10,
                        }}>
                            If you are requesting the immediate wait time, please call the hospital. If you are having a heart attack, stroke, or any life-threatening emergency, please call <Text style={{
                                color:'rgba(227,54,74,1)'
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
    this.props.navigation.push('shortestWaitTimeList')
  }

  gotoSymtoms() {
      this.props.navigation.push('symtomsList')
  }

  gotoSearch() {
    this.props.navigation.push('searchByLocation', {'isForSearch':true})
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
