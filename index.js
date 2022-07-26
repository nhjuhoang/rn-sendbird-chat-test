/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import LockScreenIncoming from './LockScreenIncoming';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

import SendBirdCalls from 'react-native-sendbird-calls';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(
  'IncomingVirtualNativeScreen',
  () => LockScreenIncoming,
);

AppRegistry.registerHeadlessTask(
  'VcHeadlessService',
  () => (params: Record<string, any>) =>
    new Promise(resolve => {
      console.log('VcHeadlessServiceVcHeadlessService ********  ', params);
      const sendbirdCall = params.sendbird_call || '';
      const call = JSON.parse(sendbirdCall);
      const callId = call?.command?.payload?.call_id || '';
      switch (params?.ACTION) {
        case 'DENIED': {
          if (callId) {
            SendBirdCalls.endIncomingCallNeedAuthentication(callId);
            resolve();
            return;
          }
          break;
        }
        case 'ACCEPT': {
          if (callId) {
            SendBirdCalls.acceptIncomingCallNeedAuthentication(callId);
            resolve();
            return;
          }
          break;
        }
        default: {
          resolve();
          break;
        }
      }
    }),
);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const data = remoteMessage?.data;
  if (!data) {
    return;
  }

  const sendbirdCall = remoteMessage.data?.sendbird_call || '';
  const call = JSON.parse(sendbirdCall);
  const callId = call?.command?.payload?.call_id || '';
  const type = call?.command?.type || '';

  if (type === 'dial') {
    const message = remoteMessage.data?.message || '';
    const timeout = 60; // second
    const params = {
      title: 'Cuộc gọi đến từ phòng khám',
      description: message || 'Bạn đang có cuộc gọi đến',
      timeoutAfter: timeout * 1000,
      isNativeScreen: true,
      ...remoteMessage.data,
    };
    SendBirdCalls.wakeAppIncomingCall(params);
    // console.log('Ố dè *******setBackgroundMessageHandler*  ', params);
    // if (Platform.Version >= 29) {
    //   const isDeviceLocked = await SendBirdCalls.getDeviceLocked();
    //   if (isDeviceLocked) {

    //   } else {
    //     SendBirdCalls.wakeApp(params);
    //   }
    // } else {
    //   SendBirdCalls.resumeApp(params);
    // }
  } else if (type === 'cancel') {
    await SendBirdCalls.cancelComingCallNotification();
  }
});
