import React from 'react';
import {
  View,
  StyleSheet,
  Button,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import {SendBirdCalls} from 'react-native-sendbird-calls';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {EventType} from '@notifee/react-native';

import CallScreen from './CallScreen';
import Calling from './Calling';
import {handleIncomingSendBirdCall} from '.';

type Props = {};

const APP_ID = 'DCC02496-AE70-4480-BAAE-7ACFC55F9C24';

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

export default function () {
  const [isAuthenticate, setIsAuthenticate] = React.useState(false);
  const [caller, setCaller] = React.useState({});
  const [callInfo, setCallInfo] = React.useState({
    calling: false,
    callId: '',
    isVideoCall: false,
    connected: false,
  });

  React.useEffect(() => {
    const init = async () => {
      await SendBirdCalls.setup(APP_ID)
        .then(() => console.log('[SETUP SUCCESS]'))
        .catch(() => console.log('[SETUP FAILD]'));

      const callerId = await AsyncStorage.getItem('@callerId');
      if (callerId) {
        authenticate(callerId);
        setIsAuthenticate(true);
      }
    };
    init();
  }, []);

  React.useEffect(() => {
    if (!isAuthenticate) {
      return () => {};
    }
    const handleDirectCallDidConnect = data => {
      console.log('[DirectCallDidConnect]: ', data);
      const {callId, isVideoCall} = data;
      setCallInfo(cur => ({
        ...cur,
        calling: true,
        callId,
        isVideoCall,
        connected: true,
      }));
    };

    const handleDirectCallDidEnd = data => {
      console.log('[DirectCallDidEnd]: ', data);
      setCallInfo(cur => ({
        ...cur,
        calling: false,
        callId: '',
        isVideoCall: false,
        connected: false,
      }));
    };

    SendBirdCalls.addEventListener(
      'DirectCallDidConnect',
      handleDirectCallDidConnect,
    );
    SendBirdCalls.addEventListener('DirectCallDidEnd', handleDirectCallDidEnd);
    return () => {
      SendBirdCalls.removeAllEventListeners();
    };
  }, [isAuthenticate]);

  React.useEffect(() => {
    if (!isAuthenticate) {
      return () => {};
    }
    messaging().onMessage(handleIncomingSendBirdCall);

    (async () => {
      const initialNotification = await notifee.getInitialNotification();
      console.log('[initialNotification] :  ', initialNotification);
      if (initialNotification) {
        const {
          notification: {data: notificationData, id: notificationId},
          pressAction: {id},
        } = initialNotification;
        const {sendbird_call: sendbirdCall} = notificationData;
        const call = JSON.parse(sendbirdCall);
        const callId = call?.command?.payload?.call_id || '';
        console.log('[CALL DATA] :  ', call);
        console.log('[CALLID] :  ', callId);

        if (id === 'decline') {
          try {
            await notifee.cancelNotification(callId);
            const data = await SendBirdCalls.endCall(callId);
          } catch (e) {}
        }
        if (id === 'accept') {
          try {
            const data = await SendBirdCalls.acceptCall(callId);
          } catch (e) {
            console.log('[acceptCall] ERROR :  ', e, callId);
          }
        }
      }
    })();
  }, [isAuthenticate]);

  React.useEffect(() => {
    if (!isAuthenticate) {
      return () => {};
    }
    return notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('[notifee onForegroundEvent]  ', type, detail);
      const {notification, pressAction} = detail;

      if (type === EventType.ACTION_PRESS) {
        const {sendbird_call: sendbirdCall} = notification.data;
        const call = JSON.parse(sendbirdCall);
        const callId = call?.command?.payload?.call_id || '';
        const pressId = pressAction?.id || '';
        if (pressId === 'accept') {
          try {
            await notifee.cancelNotification(callId);
            console.log('[accept call]', callId);
            const data = await SendBirdCalls.acceptCall(callId);
          } catch (e) {
            console.log('[acceptCall] ERROR :  ', e, callId);
          }
        } else if (pressId === 'decline') {
          try {
            const data = await SendBirdCalls.endCall(callId);
            await notifee.cancelNotification(callId);
          } catch (e) {
            console.log('[decline] ERROR :  ', e, callId);
          }
        }
      }
    });
  }, [isAuthenticate]);

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
      <Button title="nhieu1" onPress={() => authenticate('nhieu1')} />
      <Button title="nhieu2" onPress={() => authenticate('nhieu2')} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
