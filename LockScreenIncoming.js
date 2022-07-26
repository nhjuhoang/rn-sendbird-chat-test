import React from 'react';
import {
  NativeModules,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import {SendBirdCalls} from 'react-native-sendbird-calls';

type Props = {
  callCenterId: string,
  callerName: string,
  hasVideo: boolean,
  uuid: string,
  isNativeScreen: boolean, // alway true
};

export default function LockScreenComingCall(props: Props) {
  React.useEffect(() => {
    // SendBirdCallsEvents.listenerEnded()
    return () => {};
  }, []);

  const handlePress = () => {
    console.log('LockScreenComingCall ********  ', props);
    SendBirdCalls.navigateMainApp({});
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text color="white" style={{textAlign: 'center'}}>
          Mở khóa màn hình vào phòn tư vấn
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  button: {
    height: 72,
    width: 320,
    borderRadius: 8,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
