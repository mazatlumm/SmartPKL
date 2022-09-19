/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from "react-native-push-notification";
import CronJob from "react-native-cron-job";

const CronJobTask = async () => {
      console.log('tes cronjob');
      handleNotification();
      CronJob.completeTask();
};

const handleNotification = () => {
  PushNotification.localNotification({
      channelId:"abogoboga",
      title:"Selamat Pagi",
      message:"Jangan lupa untuk mengisi presensi hari ini ya...!",
  });
}

PushNotification.configure({
  
    onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        if (notification.foreground) {
          PushNotification.localNotification({channelId:"abogoboga",message:notification.message,details:{repeted:true}})
        }
    },
    requestPermissions: Platform.OS === 'ios'
    
})

AppRegistry.registerHeadlessTask('CRONJOB', () => CronJobTask);
AppRegistry.registerComponent(appName, () => App);
