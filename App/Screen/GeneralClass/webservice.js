import React, { Component } from 'react'

import {
   StyleSheet,
   Text,
   TouchableOpacity,
   Platform,
   Alert,
   NetInfo,
   AppRegistry,
   AsyncStorage
} from 'react-native'

// export var isConnectedGlobal = ''
import Events from 'react-native-simple-events';
import Constant from './Constant';
// import DeviceInfo from 'react-native-device-info';
// import * as Keychain from 'react-native-keychain';
import { NavigationActions } from 'react-navigation'


//const navigate;
export default class webservice extends Component {
    constructor(props) {
        super(props);  
    }
    render() {
    return (
      <View style={styles.container}>
            
      </View>
    );
  }
}


module.exports = {
    
    isConnectedGlobal : '',
    //local link
//   serverUri : 'http://192.168.0.19:8040/api/',   
 
  //live inhouse link
//   serverUri : 'http://ergentapp.sandboxserver.info/api/',
    // serverUri : 'http://18.188.101.156/ERgentApp/api/',
    serverUri : 'http://13.59.163.66/ERgentApp/api/',
    languageId : '',
    deviceToken :'',
    CALL_ONETIME:'',


    //live link
    // serverUri : 'http://18.221.113.251:8181//api/v1/main',      
  
    /*
    callGlobalWebservice(methodName,params) {
         
        //check for the Device id
        var DeviceId = '';
        Keychain
        .getGenericPassword()
        .then(function(credentials) {
          console.log('Credentials successfully loaded for user ' + credentials);
             if(credentials == false)
             {
                   //credantial not set yet
                  Keychain
                  .setGenericPassword('NimeNoEis',DeviceInfo.getUniqueID())
                  .then(function() {
                    console.log('Credentials saved successfully!');
                     DeviceId = DeviceInfo.getUniqueID()
                     if(methodName == 'editprofile')
                     {
                        console.log('credantial false') 
                        module.exports.callWebservicewithImage(methodName,params,DeviceId)
                     }
                     else
                     {
                        module.exports.callWebservice(methodName,params,DeviceId)
                     }
                     
                  });

             } 
             else
             {
                  //Credantial set
                console.log("credantial is",credentials)  
                DeviceId = credentials.password
                if(methodName == 'editprofile')
                {
                    console.log('credantial false')  
                   module.exports.callWebservicewithImage(methodName,params,DeviceId)
                }
                else
                {
                   module.exports.callWebservice(methodName,params,DeviceId)
                }
                
             } 
        }).catch(function(error) {
            alert(Constant.DEVICEID_NOT_FOUND)
            console.log('Keychain couldn\'t be accessed! Maybe no value set?', error);
        });

    },*/
  
    callWebservice(methodName,param,deviceId) {
       
        console.log('final device id is my ',deviceId)
        // AsyncStorage.getItem("DEVICETOKENFCM").then((value) => {
            
        //     if(deviceId != '')
        //     {
                console.log("param",param)
                var params = Object.assign({},param)
                console.log("params",params)
                // params['app_version'] = DeviceInfo.getVersion()
                // params['device_type'] = Platform.OS === 'ios' ? '1' : '2' 
                // params['os_version'] = DeviceInfo.getSystemVersion()
                // params['device_token'] = ''
                // params['device_id'] = DeviceInfo.getUniqueID()
                // params['language_id'] = this.languageId
                // params['method_name'] = methodName
    
                var strObj = JSON.stringify(params)
                
                console.log('Final Request is',params);
                fetch(this.serverUri+methodName, {
                     headers: {
                        //'Accept': 'application/x-www-form-urlencoded',
                        'Content-Type': 'application/json',
                    },
                    method: 'POST', 
                    body: strObj
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log("getting responce in Webservice class is",responseJson);
                        
                    if(responseJson.code == '1010' || responseJson.code == '1001')
                    {
    
                        //1010 block user
                        //1001 delete user
                        Alert.alert(
                            Constant.APP_NAME,
                            responseJson.message,
                           [
                              {text: 'Okay', onPress:() => Events.trigger('DeleteUser')},
                           ],
                           { cancelable: false }
                        )
                    }
                    else if (responseJson.code == '102')
                    {
                        //version management
                        this.updateVersionfunction()
                    }
                    else
                    {
                        //If getting Proper Responce
                        Events.trigger('receiveResponse', responseJson)
                    }
    
                 })
                .catch((error) => {
                    console.log("getting error in Webservice class is",error);
                    //alert("Somthing went wrong,please try latter");
                     Events.trigger('receiveResponse', responseJson)
                 });   
        //     }
        //     else
        //     {
        //         alert(Constant.DEVICEID_NOT_FOUND)
        //     }


        // }).done();
 
       
    },
    
    //Multipart Image Uploading
    callWebservicewithImage(methodName,params,deviceId) {
        
         console.log('final device id is my ',deviceId)
        //  AsyncStorage.getItem("DEVICETOKENFCM").then((value) => {
        //     if(deviceId != '')
        //     {
   
               const data = new FormData();
   
               console.log("file image is",params.image)

                if(params.image !== null) {
                    var ext = params.image.uri.substring(params.image.uri.lastIndexOf(".")+1);
                    var name = 'photo1.'+ext 
                    if (methodName == 'UploadVendor') {
                        // if (Platform.OS === 'ios') {
                            data.append('VendorImage', {uri: params.image.uri, name:name, type:'multipart/form-data'});
                        // }
                        // else {
                        //     data.append('VendorImage', {uri: params.image.uri, name:name, type:'multipart/form-data'});
                        // }
                    }
                    else {
                        // if (Platform.OS === 'ios') {
                            data.append('UserImagePath', {uri: params.image.uri, name:name, type:'multipart/form-data'});
                        // }
                        // else {
                        //     // data.append('UserImagePath', {...params.photoResponse, name:name, type:params.photoResponse.type});
                        //     data.append('UserImagePath', {uri:params.photoResponse.uri,type:'image/jpeg',name:name});
                        // }
                    }
                }
              
               var reqData = {};
            //    reqData.method_name = methodName; 
            //    reqData.body = {};
   
            //    reqData.body.app_version = DeviceInfo.getVersion()
            //    reqData.body.device_type = Platform.OS === 'ios' ? '1' : '2'
            //    reqData.body.os_version = DeviceInfo.getSystemVersion()
            //    reqData.body.device_token = value
            //    reqData.body.device_id = deviceId
            //    reqData.body.language_id = 'en'
               
            //    reqData.body.user_auth_token = params.user_auth_token
            //    reqData.body.full_name = params.full_name
            //    reqData.body.authToken =  params.authToken
            //    reqData.body.address = params.address
            //    reqData.body.zipcode = params.zipcode
            //    reqData.body.email = params.email

            Object.keys(params).map((key, index) => ( 
                // data.append(key, JSON.stringify(params[key]))
                key != 'image' && key != 'photoResponse' ? data.append(key, params[key]) : ''
                
            ))

            // reqData = Object.assign({},params)

            //    data.append('json', JSON.stringify(reqData));
               
               console.log('Final Request is',data);
   
                fetch(this.serverUri+methodName, {
                     headers: {
                        //'Accept': 'application/x-www-form-urlencoded',
                        'Content-Type':'multipart/form-data'      //'application/octet-stream',
                    },
                    method: 'POST', 
                    body: data
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log("getting responce in Webservice class is",responseJson);
                        
                    if(responseJson.code == '1010' || responseJson.code == '1001')
                    {
    
                        //1010 block user
                        //1001 delete user
                        Alert.alert(
                            Constant.APP_NAME,
                            responseJson.message,
                           [
                              {text: 'Okay', onPress:() => Events.trigger('DeleteUser')},
                           ],
                           { cancelable: false }
                        )
                    }
                    else if (responseJson.code == '102')
                    {
                        //version management
                        // this.updateVersionfunction()
                    }
                    else
                    {
                        //If getting Proper Responce
                        console.log('sucess')
                        Events.trigger('receiveResponse', responseJson)
                    }    
                 })
                .catch((error) => {
                    console.log("getting error in Webservice class is",error);
                    //alert("Somthing went wrong,please try latter");
                     Events.trigger('receiveResponse', error)
                 });   
        //     }
        //     else
        //     {
        //         alert(Constant.DEVICEID_NOT_FOUND)
        //     }
        // }).done();        
     }, 
 
    //network method
    initNetInfoForConnectivity(){
        NetInfo.isConnected.addEventListener(
            'connectionChange',
            this.handleConnectivityChange.bind(this)
        );
        NetInfo.isConnected.fetch().done(
            (isConnected) => {isConnectedGlobal = isConnected  }
        );
    },
    handleConnectivityChange (isConnected) {
        console.log("isConnected:=",isConnected)
        // this.setState({
            isConnectedGlobal = isConnected,
        // });
        NetInfo.isConnected.removeEventListener(
            'connectionChange',
            // this._handleConnectivityChange
        );
        NetInfo.isConnected.addEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );
    }, 

    // //Multipart image Uploading 
    // callGlobalWebserviceForimage(methodName,reqData) {
         
       
    //     var version = VersionNumber.buildVersion;

    //     reqData.method_name ="site_insert_listing_new"; 
    //     reqData.body.user_build_version='2';   
    //     reqData.body.user_device_type=Platform.OS === 'ios' ? 1 : 0; 

    //     var strObj = 'json='+JSON.stringify(obj)

    //     console.log("reqest string is",strObj);
    //     fetch(serverUri, {
    //         headers: {
    //           // 'Accept':false,
    //           // 'Content-Type':'multipart/form-data;',
    //            'processData':false,
    //            'contentType':false
    //         },
    //         method: 'POST', 
    //         body: strObj
    //     })
    //     .then((response) => response.json())
    //     .then((responseJson) => {
    //         console.log("getting responce in Webservice class is",responseJson);
    //         Events.trigger('receiveResponse', responseJson)
    //      })
    //     .catch((error) => {
    //         console.log("getting error in Webservice class is",error);
    //         //alert("Somthing went wrong,please try latter");
    //          Events.trigger('receiveResponse', responseJson)
    //      });   
    //  },
    
    updateVersionfunction()
    {

        console.log('this method is  called')
        //  Alert.alert(
        //     Constant.APP_NAME,
        //     'New app version is available,Plaase select the ok for the updating app',
        //     [
        //         {text: 'Okay', onPress: () => console.log("update")},
        //     ],
        //     { cancelable: false }
        // )
    }
      
};
