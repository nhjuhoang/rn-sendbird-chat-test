/* eslint-disable prettier/prettier */
import React from 'react';
import {
  View,
  StyleSheet,
  Button,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import {SendBirdCalls, SendBirdCallsEvents} from 'react-native-sendbird-calls';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {EventType} from '@notifee/react-native';

import Calling from './Calling';
import CallScreen from './CallScreen';
import InComingCall from './InComingCall';

type Props = {};

const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    } else {
      const authorizationStatus = await messaging().requestPermission();
      if (authorizationStatus) {
        console.log(authorizationStatus);
      }
    }
  } catch (err) {
    console.warn(err);
  }
};


export default function (props) {
  const [isAuthenticate, setIsAuthenticate] = React.useState(false);
  const [caller, setCaller] = React.useState({});
  const [callInfo, setCallInfo] = React.useState({
    calling: false,
    callId: '',
    isVideoCall: false,
    connected: false,
    inComingCall: false,

    isLocalAudioEnabled: true,
    isLocalVideoEnabled: true,
    isRemoteAudioEnabled: true,
    isRemoteVideoEnabled: true,
  });

  React.useEffect(() => {
    const init = async () => {
      const callerId = await AsyncStorage.getItem('@callerId');
      if (callerId) {
        authenticate(callerId);
      }
    };
    init();
  }, []);



  React.useEffect(() => {
    if (!isAuthenticate) {
      return () => {};
    }

    (async () => {
      const initialNotification = await notifee.getInitialNotification();
      const ongoingCalls = await SendBirdCalls.getOngoingCalls();
      console.log('[initialNotification] :  ', initialNotification);
      console.log('[ongoingCalls] :  ', ongoingCalls);

    if (!initialNotification) {return;}

      const sendbirdCall = initialNotification?.notification?.data?.sendbird_call || '';
      const call = JSON.parse(sendbirdCall);
      const pressActionId = initialNotification?.pressAction?.id || '';
      const callId = call?.command?.payload?.call_id || '';

      console.log('[CALL DATA] :  ', call);
      console.log('[CALLID] :  ', callId);

      if (initialNotification) {
        if (pressActionId === 'decline') {
          try {
            await notifee.cancelNotification(callId);
            await SendBirdCalls.endCall(callId);
          } catch (e) {}
        }
        if (pressActionId === 'accept') {
          try {
            await SendBirdCalls.acceptCall(callId).then((res) => {
              console.log('Ố dè ******** acceptCall ', res, callId);
              // SendBirdCalls.getCall(callId).then((resGetCall) => {
              //   console.log('SendBirdCalls.getCall:::  ', resGetCall);
              // });
            }).catch((e) => {
              console.log('[acceptCall] ERROR : 111 ', e, callId);
            });
          } catch (e) {
            console.log('[acceptCall] ERROR :  ', e, callId);
          }
        }
      }
    })();
  }, [isAuthenticate]);

  // onForegroundEvent
  React.useEffect(() => {
    if (!isAuthenticate && Platform.OS !== 'android') {
      return () => {};
    }

    return notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('[notifee onForegroundEvent]  ', type, detail);
      const {notification, pressAction} = detail;

      if (type === EventType.ACTION_PRESS) {
        const sendbirdCall = notification.data?.sendbird_call || {};
        const call = JSON.parse(sendbirdCall);
        const callId = call?.command?.payload?.call_id || '';
        const pressId = pressAction?.id || '';
        if (pressId === 'accept') {
          try {
            await notifee.cancelNotification(callId);
            console.log('[accept call]', callId);
            await SendBirdCalls.acceptCall(callId);
          } catch (e) {
            console.log('[acceptCall] ERROR :  ', e, callId);
          }
        } else if (pressId === 'decline') {
          try {
            SendBirdCalls.endCall(callId);
            await notifee.cancelNotification(callId);
          } catch (e) {
            console.log('[decline] ERROR :  ', e, callId);
          }
        }
      }
    });
  }, [isAuthenticate]);
  // end onForegroundEvent

  const authenticate = async (userId: string) => {
    try {
      const result = await SendBirdCalls.authenticate(userId);
      setCaller(result);
      await AsyncStorage.setItem('@callerId', result.userId);
      await requestCameraPermission();
      const token = await messaging().getToken();
      if (token) {
        console.log('TOKEN: ', token);
        if (Platform.OS === 'android') {
          SendBirdCalls.registerPushToken(token);
        } else {
          SendBirdCalls.setupVoIP();
        }
      }
      setIsAuthenticate(true);
    } catch (error) {
      console.log('[ERROR] ', error);
      setIsAuthenticate(false);
    }
  };

  const onCall = async (calleeId, isVideoCall) => {
    if (!calleeId) {
      return;
    }
    try {
      const data = await SendBirdCalls.dial(calleeId, isVideoCall);
      const {callId} = data;
      console.log('[DIAL]', data);
      setCallInfo(cur => ({...cur, calling: true, callId, isVideoCall}));
    } catch (e) {
      setCallInfo(cur => ({...cur, calling: false}));
      Alert.alert('[DIAL ERROR]', e.message);
      console.log('[DIAL ERROR]', e.code, e.message);
    }
  };



  const acceptCall = async () => {
    console.log('Ố dè ********  ', callInfo);
    await SendBirdCalls.acceptCall(callInfo.callId);
  };

  const endCall = async () => {
    await SendBirdCalls.endCall(callInfo.callId)
      .then(() => {
        setCallInfo(cur => ({
          ...cur,
          calling: false,
          callId: '',
          isVideoCall: false,
        }));
      })
      .catch(() => {
        console.log('[END CALL ERROR]');
      });
  };

  if (callInfo?.inComingCall) {
    return (
    <InComingCall
      callInfo={callInfo}
      acceptCall={acceptCall}
      endCall={endCall}
    />
  );
}

  if (callInfo.calling) {
    return <Calling callInfo={callInfo} endCall={endCall} />;
  }

  if (isAuthenticate) {
    return (
      <CallScreen
        caller={caller}
        onCall={onCall}
        onLogout={async () => {
          await AsyncStorage.clear();
          setCaller(null);
          setIsAuthenticate(false);
          setCallInfo({});
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Button title="nhieu03" onPress={() => authenticate('nhieu03')} />
      <Button title="nhieu04" onPress={() => authenticate('nhieu04')} />
      <Button title="Chim sẻ" onPress={() => authenticate('chimse')} />
      <Button title="Đại bàng" onPress={() => authenticate('daibang')} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
