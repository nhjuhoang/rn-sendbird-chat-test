import React from 'react';
import {Platform, Alert} from 'react-native';
import SendBird from 'sendbird';
import messaging from '@react-native-firebase/messaging';

export default function SendBirdConfig({accountId}) {
  React.useEffect(() => {
    const connectSendBird = async () => {
      const sb = new SendBird({appId: '8905DE33-949A-4F12-A2CB-99A68365407B'});
      // const response = await virtualClinicApi.requestGetSendBirdAccount();
      // const accountId = response?.data?.data?.account?.accountId;
      // const sendbirdToken =
      //   response?.data?.data?.account?.thirdParty?.sendbird?.token;
      // if (!response.ok || !accountId || !sendbirdToken) {
      //   //TODO tracking
      //   return;
      // }
      try {
        await sb.connect(accountId);
        if (Platform.OS === 'ios') {
          const token = await messaging().getAPNSToken();
          try {
            await sb.registerAPNSPushTokenForCurrentUser(token || '');
          } catch (error) {
            console.log('SendBird register APNS token error');
          }
        } else {
          const token = await messaging().getToken();
          try {
            await sb.registerGCMPushTokenForCurrentUser(token);
          } catch (error) {
            console.log('SendBird register GCM token error');
          }
        }
      } catch (error) {
        setTimeout(() => Alert.alert('connect SendBird ERROR '), 5000);
      }
    };

    // const disConnectSendBird = async () => {
    //   const sb = SendBird.getInstance();
    //   if (sb.getConnectionState() === 'OPEN') {
    //     if (Platform.OS === 'ios') {
    //       const token = await messaging().getAPNSToken();
    //       try {
    //         await sb.unregisterAPNSPushTokenForCurrentUser(token || '');
    //       } catch (error) {
    //         // TODO tracking
    //       }
    //     } else {
    //       const token = await messaging().getToken();
    //       try {
    //         await sb.unregisterGCMPushTokenForCurrentUser(token);
    //       } catch (error) {
    //         // TODO tracking
    //       }
    //     }
    //     await sb.disconnect();
    //     // setTimeout(() => Alert.alert('DISCONNECT SENDBIRD'), 1000);
    //   }
    // };

    // if (isLogged) connectSendBird();
    // else disConnectSendBird();
    connectSendBird();
  }, []);

  return null;
}
