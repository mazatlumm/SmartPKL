import React, {useEffect, useState, useRef, AppRegistry} from 'react'
import WebView from 'react-native-webview'
import {PermissionsAndroid, StyleSheet, View, Text, Alert, Image, BackHandler, RefreshControl, SafeAreaView, ScrollView} from 'react-native';
import RNBootSplash from "react-native-bootsplash";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import Spinner from 'react-native-loading-spinner-overlay';
import PushNotification from "react-native-push-notification";
import CronJob from "react-native-cron-job";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
        title: 'Location Access Precission',
        message: 'We would like to use your location',
        buttonPositive: 'Okay'
    },
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    {
        title: 'Location Access Permission',
        message: 'We would like to use your location',
        buttonPositive: 'Okay'
    },
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
        title: 'Camera Access Permission',
        message: 'We would like to use your camera',
        buttonPositive: 'Okay'
    },
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    {
        title: 'READ EXTERNAL STORAGE Access Permission',
        message: 'We would like to use your READ EXTERNAL STORAGE',
        buttonPositive: 'Okay'
    },
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
        title: 'WRITE EXTERNAL STORAGE Access Permission',
        message: 'We would like to use your WRITE EXTERNAL STORAGE',
        buttonPositive: 'Okay'
    },
);

const App = () => {

    const [spinner, setspinner] = useState(false);
    const [forceReload, setforceReload] = useState(false);
    const [isLogin, setisLogin] = useState(false);
    const [IDUser, setIDUser] = useState('');

    const webViewRef = useRef(null);

    useEffect(() => {
        RNBootSplash.hide({fade: true});
        createChannelNotification();
        setspinner(true);
        setTimeout(() => {
            setspinner(false)
          }, 3000);
        getUserId();
        console.log(IDUser);
        const backAction = () => {
            if(webViewRef.current != null){
                webViewRef.current.goBack();
            }
            return true;
        };

        CronJob.startCronJob(7,0); //Cronjob

        const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
        );
    
        return () => backHandler.remove();
    }, [])

    const storeDataIdSuser = async (value) => {
        try {
            await AsyncStorage.setItem('@id_user', value)
        } catch (e) {
            // saving error
        }
    }
    const getUserId = async () => {
        try {
            const value = await AsyncStorage.getItem('@id_user')
            if (value !== null) {
                // console.log('ID USER ASYNC: '+value)
                setIDUser(value);
            }
        } catch (e) {
            // error reading value
        }
    }

    var StatusKoneksi = false;
    // CekInternet
    const CekInternet = NetInfo.addEventListener(state => {
    // console.log("Connection type", state.type);
    // console.log("Is connected?", state.isConnected);
    StatusKoneksi = state.isConnected;
    });
  
    // CekInternet
    CekInternet();

    function displayError() {
        Alert.alert(
        "Internet Terputus",
        "Pastikan Anda Memiliki Koneksi Internet",
        [
        { text: 'OK', onPress: () => setforceReload(true) },
        ],
        { cancelable: false });
    }

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
    }, []);

    const createChannelNotification = () => {
        PushNotification.createChannel({
            channelId:"abogoboga",
            channelName:"Testing Notification"
        })
    }

    const handleNotification = () => {
        PushNotification.localNotification({
            channelId:"abogoboga",
            title:"Login Status",
            message:"Anda Berhasil Login",
        });
    }

    if(StatusKoneksi){
        return (
            <View style={{ flex: 1 }}>
                <Spinner
                    visible={spinner}
                    textContent={'Tunggu Sebentar...'}
                    textStyle={{color: '#FFF', fontFamily:'arial'}}
                />
                <WebView 
                    onError={() => displayError()}
                    renderError={() => displayError()}
                    forceReload={forceReload}
                    onLoad={()=>setspinner(false)}
                    onLoadStart={()=>setspinner(true)}
                    renderLoading={()=>setspinner(true)}
                    source={{uri: 'https://alicestech.com/smart_pkl'}} 
                    geolocationEnabled={true} 
                    javaScriptEnabled={true}
                    ref={webViewRef}
                    // onNavigationStateChange={(navState) => {
                    //     canGoBack = navState.canGoBack;
                    //     // console.log('Can Go Back: '+ canGoBack);
                    // }}
                    onMessage={(event) => {
                        console.log('Data Webview: ' + event.nativeEvent.data)
                        const JsonData = JSON.parse(event.nativeEvent.data);
                        const jenis_data = JsonData.jenis_data;
                        console.log('Jenis Data : ' + jenis_data)
                        if(jenis_data == 'user'){
                            storeDataIdSuser(JsonData.data_user.id_user);
                            setIDUser(JsonData.data_user.id_user);
                            console.log('IDUser: '+IDUser)
                            if(!isLogin){
                                handleNotification();
                                setisLogin(true);
                            }
                        }
                }}/>
            
            </View>
        )
    }else{
        setTimeout(() => {
            if(!StatusKoneksi){
                displayError();
            }
          }, 5000);
        return (
            <View style={{height:'100%', justifyContent:'center', alignItems:'center'}}>
                <Image style={{width:'27%', height:'27%', resizeMode:'contain', marginVertical:0, paddingVertical:0 }} source={require('./assets/smk.png')} />
                <Text style={{ color:'white', fontSize:12, fontFamily:'arial' }}>Sedang Menyiapkan Aplikasi...</Text>
                <Text style={{ color:'white', fontSize:12, fontFamily:'arial' }}>Pastikan Smartphone Anda Memiliki Koneksi Internet</Text>
            </View>
        )
    }
}

export default App