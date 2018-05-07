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
} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class Home extends Component<Props> {
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
                height:64,
                backgroundColor:'rgba(227,54,74,1)',
                width:'100%',
                justifyContent:'center',
                alignItems:'center',
            }}>

                <Text style={{
                    color:'white',
                    fontSize: 18,
                    fontWeight:'bold',
                    marginTop: Platform.OS === 'ios' ? 12 : 12,
                }}>HOME</Text>

            </View>

            <View style={{
                // backgroundColor:'red',
                marginTop:100,
                width:'90%',
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

            <View style={{
                height:55,
                backgroundColor:'white',
                width:'90%',
                marginTop:50,
                justifyContent:'center',
                flexDirection:'row',
                alignItems:'center',
            }}> 
                <Image style={{
                    height:45,
                    width:45,
                    backgroundColor:'red',
                    marginLeft:5,
                }}></Image>

                <Text style={{
                    width:'50%',
                }}>Symtoms</Text>

                <Image style={{
                    height:45,
                    width:45,
                    backgroundColor:'red',
                    marginLeft:5,
                }}></Image>

            </View>
        </View>
    );
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
