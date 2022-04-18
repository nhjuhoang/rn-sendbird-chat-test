/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidCategory,
  EventType,
} from '@notifee/react-native';
import {SendBirdCalls} from 'react-native-sendbird-calls';

AppRegistry.registerComponent(appName, () => App);

// Register background handler
messaging().setBackgroundMessageHandler(handleIncomingSendBirdCall);
notifee.onBackgroundEvent(notifeeBackgroundEventHandler);

async function notifeeBackgroundEventHandler({type, detail}) {
  console.log(
    '[notifeeBackgroundEventHandler]: ',
    'type:' + type,
    'detail:' + detail,
  );
  if (type === EventType.ACTION_PRESS) {
    const {
      notification,
      pressAction: {id},
    } = detail;
    if (id === 'accept') {
      const {sendbird_call: sendbirdCall} = notification.data;

      try {
        const call = JSON.parse(sendbirdCall);
        const {
          command: {
            payload: {call_id: callId},
          },
        } = call;
        // can't accept/decline call here, the app isn't ready yet
        // const data = await SendBirdCalls.acceptCall(callId);
        await notifee.cancelNotification(callId);
      } catch (e) {}
    } else if (id === 'decline') {
      const {sendbird_call: sendbirdCall} = notification.data;
      try {
        const call = JSON.parse(sendbirdCall);
        const {
          command: {
            payload: {call_id: callId},
          },
        } = call;
        const data = await SendBirdCalls.endCall(callId);
        await notifee.cancelNotification(callId);
      } catch (e) {}
    }
  }
}

export async function handleIncomingSendBirdCall(remoteMessage) {
  console.log('[handleIncomingSendBirdCall]:  ', remoteMessage);
  const {message, sendbird_call: sendbirdCall} = remoteMessage.data;

  if (sendbirdCall) {
    try {
      const call = JSON.parse(sendbirdCall);
      const {
        command: {
          payload: {call_id: callId},
          type,
        },
      } = call;

      if (callId) {
        const channelId = await notifee.createChannel({
          id: 'important',
          name: 'Important Channel',
          importance: AndroidImportance.HIGH,
        });

        if (type === 'dial') {
          // Display a notification
          await notifee.displayNotification({
            id: callId,
            title: 'SendBirdCalls',
            body: message,
            data: remoteMessage.data,
            android: {
              channelId,
              category: AndroidCategory.CALL,
              importance: AndroidImportance.HIGH,
              autoCancel: false,
              ongoing: true,
              actions: [
                {
                  title: 'DECLINE',
                  pressAction: {
                    id: 'decline',
                    launchActivity: 'default',
                  },
                },
                {
                  title: 'ACCEPT',
                  pressAction: {
                    id: 'accept',
                    launchActivity: 'default',
                  },
                },
              ],
              // smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
            },
          });
        } else if (type === 'cancel') {
          await notifee.cancelNotification(callId);
        }
      }
    } catch (e) {}
  }
}
