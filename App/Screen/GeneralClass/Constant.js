import React, { Component } from 'react'

import {
   StyleSheet,
   Text,
   TouchableOpacity,
   Dimensions
} from 'react-native'




module.exports = {
    DEVICE_WIDTH : Dimensions.get('window').width,
    DEVICE_HEIGHT : Dimensions.get('window').height,

     // 'https://www.tristatetechnology.com/webservice/barApp/faq.html',
     //'https://www.tristatetechnology.com/webservice/barApp/terms&cond.html',
   
    //API_Key

    //Inhouse Key
    // GOOGLE_API_KEY : 'AIzaSyAPWSqlk2JrfgMQAjDOYGcJaIViPKavahg',

    //Client Key
    GOOGLE_API_KEY : 'AIzaSyDPe5V2UvMJW_rGYpGxPPAGz4kZk7LmEOc',

    //Static Url Page 
    FAQ_LINK_ENGLISH : 'http://18.221.113.251/faq-eng.html',
    FAQ_LINK_GERMAN : 'http://18.221.113.251/faq-german.html',                        
    TERMS_CONDITION : 'http://18.221.113.251/terms_condition.html',    
    CONTACTUS_EMAIL : 'ergentdeveloper@gmail.com',                 

    //Alert Message 
    NETWORK_ALERT : 'Please check your internet connectivity.',
    APP_NAME :'ERgent',
    DEVICEID_NOT_FOUND:'Your device id is not found, please try again.',
  
    ENTER_EMAIL:'Please enter email.',
    ENTER_VALIDEMAIL:'Please enter valid email.',
    ENTER_PASSWORD:'Please enter password.',
    ENTER_VALIDPASSWORD:'Please enter valid six digit password.',
    ENTER_CONFIRMPASS:'Please enter confirm password.',
    //registration
    ENTER_FULLNAME:'Please enter full name.',
    ENTER_LOCATION:'Please enter the location.',
    ENTER_ZIPCODE:'Please enter zipcode.',
    ENTER_VALID_ZIPCODE:'Please enter valid zipcode.',
    VALID_CONFIRMPASSWORD:'Password and confirm password must be same.',

    LOGOUT_MESSAGE:'Are you sure you want to signout?'
};
