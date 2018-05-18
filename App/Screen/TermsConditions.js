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
  TouchableHighlight,
  TextInput,
  StatusBar,
  TouchableWithoutFeedback,
  ListView,
  NetInfo,
  ActivityIndicator,
  WebView,
} from 'react-native';

import Constant from './GeneralClass/Constant';
import Events from 'react-native-simple-events';
import ws from './GeneralClass/webservice';
// import LS from 'Domingo/Src/Screens/GeneralClass/LocalizationStrings';

export const STATUSBAR_HEIGHT  = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight;


export default class TermsConditions extends Component {

  constructor(props) {
    console.log('props:=',props.navigation.state.params.isForPrivacy)
    super(props)
    this.state = {
      isShowHud:false,
      aboutUsResponse:'',
      cnt:0,
      title: props.navigation.state.params.isForPrivacy === '1' ? 'Privacy Policy' : 'Terms & Conditions',
      isForPrivacy: props.navigation.state.params.isForPrivacy,
    };
  }

  componentDidMount() {
    Events.on('receiveResponse', 'receiveResponseAboutUs', this.onReceiveResponse.bind(this))
    Events.on('updateUI', 'updateUIAboutUs', this.onUpdateUI.bind(this))
    // this.onWebServiceCallingForAboutUs()
  }

  onUpdateUI() {
    this.setState({
      cnt:this.state.cnt+1
    })
  }

  onReceiveResponse (responceData) {

    if (responceData.methodName == 'CMSData') {
        console.log('responceData:=',responceData)
        console.log('responceData.Results.CmsData_List[0].Description:=',responceData.Results.CmsData_List[0].Discription)
        this.setState({isShowHud: false,isDisable:false})

        if (responceData.Status == true) {
          console.log('responceData.Results.CmsData_List[0].Description:=',responceData.Results.CmsData_List[0].Discription)
          this.setState({
            aboutUsResponse:responceData.Results.CmsData_List[0].Discription
          })
        }
        else{
           alert(responceData.ErrorMessage)
        }
    }
  }

  onWebServiceCallingForAboutUs() {
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log(isConnected)
      console.log('First, is ' + (isConnected ? 'online' : 'offline'));

      if(isConnected) {
            var param = {
                  'CMSDataId':1,
            }
            console.log("param is ",param);
            this.setState({
              isShowHud : true
            })
            ws.callWebservice('CMSData',param,'')
      }
      else {
          alert(Constant.NETWORK_ALERT)
      }
    });
  }

  render() {
    var isShowHud = this.state.isShowHud;
    return (
      <View style={styles.container}>
      <View style = {{
        position:'absolute',
        top:0,
        zIndex:0,
        left:0,
        height:'100%',
        width:'100%'
      }}>
      {/* HeaderView */}
        <View style={{
          // flex:240,
          backgroundColor:'rgba(227,54,74,1)',
          flexDirection:'row',
          justifyContent:'center',
          alignItems:'center',
          width:'100%',
          height:64,
          shadowColor:'gray',
          shadowOpacity:1.0,
          shadowOffset:{ width: 0, height: 2 },
          zIndex:1,
        }}>
          <TouchableWithoutFeedback style={{ backgroundColor:'red'
                }} onPress={this.onClickMenu.bind(this)}>
            <Image style={{
                position:'relative',
                backgroundColor:'white',
                width:40,
                height:40,
                marginTop:Platform.OS === 'ios' ? 20 : 0,
                marginLeft:10
              }}
              source={require('../Images/back.png')}
              resizeMethod='resize'
              resizeMode='center'
            />
          </TouchableWithoutFeedback>
            <Text style={{
              fontSize:20,
              color:'white',
              width:Constant.DEVICE_WIDTH - 50 - 50,
              marginTop:Platform.OS === 'ios' ? 20 : 0,
              justifyContent:'center',
              textAlign:'center',
              alignItems:'center',
              // fontFamily:'Oswald-Regular',
          }}>{this.state.title}</Text>
          <TouchableWithoutFeedback style={{
                }} onPress={this.onClickMenu.bind(this)}>
            <Image style={{
                position:'relative',
                backgroundColor:'white',
                width:40,
                height:40,
                marginTop:Platform.OS === 'ios' ? 20 : 0,
                marginRight:10,
                opacity:0
              }}
              // source={require('Domingo/Src/images/static_img/Beauty.png')}
              >
            </Image>
          </TouchableWithoutFeedback>
        </View>

        {/* ContentView */}

        <View style = {{
          position:'relative',
          // height:'100%',
          width:'100%',
          flex:1
        }}>
        {/* <KeyboardAwareScrollView keyboardShouldPersistTaps={'handled'}> */}
          <WebView style={{
            height:Constant.DEVICE_HEIGHT-64,
            width:Constant.DEVICE_WIDTH,
            padding:10,
          }} source={{html: this.state.aboutUsResponse}}
          // automaticallyAdjustContentInsets={true}
          scalesPageToFit={Platform.OS === 'ios' ? false : true}
          // scrollEnabled={true}
          />
          {/* </KeyboardAwareScrollView>   */}
          { isShowHud == true ? <ActivityIndicator
                    color={'rgba(0,165,235,1)'}    //rgba(254,130,1,0.5)'
                    size={'large'}
                    style={styles.loaderStyle}
                    />: null
                }
        </View>
        </View>
      </View>
    );
  }

  onClickMenu() {
    console.log("onClickMenu clicked")
    this.props.navigation.pop()
  }
  onClickFilter() {
    console.log("onClickFilter clicked")
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor:'rgba(242,243,245,1)',
  },
  demo: Platform.select({
    ios:{
      textAlign: 'left',
      marginTop: 10,
    },
    android:{
      textAlign: 'right',
      marginTop: 10,
    }
  }),
  loaderStyle:{
      height:'10%',
      width:'20%',
      position:'absolute',
      left:'40%',
      top:'45%',
      justifyContent:'center',
  },
});
