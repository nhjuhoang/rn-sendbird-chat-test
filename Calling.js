import React from 'react';
import {View, StyleSheet, Text, Button} from 'react-native';
import {SendBirdCallsVideo} from 'react-native-sendbird-calls';

export default function Calling({
  callInfo,
  endCall,
}: {
  callInfo: {
    calling: boolean,
    callId: string,
    isVideoCall: boolean,
    connected: boolean,
  },
  endCall: () => void,
}) {
  const {callId, isVideoCall, connected} = callInfo || {};

  const renderCallConnecting = () => {
    return (
      <View style={styles.container}>
        {callId && isVideoCall ? (
          <View style={styles.container}>
            <SendBirdCallsVideo
              callId={callId}
              call={{callId: callId, local: true}}
              style={styles.remoteVideo}
            />
            <View style={styles.absoluteCenter}>
              <Text>Connecting</Text>
              <Button title={'End call'} onPress={endCall} />
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            <Text>Audio Calling...</Text>
            <Button title={'End call'} onPress={endCall} />
          </View>
        )}
      </View>
    );
  };

  const renderCallConnected = () => {
    return (
      <View style={styles.container}>
        {callId && isVideoCall ? (
          <View style={styles.container}>
            <SendBirdCallsVideo
              callId={callId}
              local={false}
              call={{callId: callId, local: false}}
              style={styles.remoteVideo}
            />
            <SendBirdCallsVideo
              callId={callId}
              local={true}
              call={{callId: callId, local: true}}
              style={styles.localVideo}
            />
            <View>
              <Text>00:00</Text>
              <Button title={'End call'} onPress={endCall} />
            </View>
          </View>
        ) : (
          <View>
            <Text>Audio (00:01...)</Text>
            <Button title={'End call'} onPress={endCall} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {connected ? renderCallConnected() : renderCallConnecting()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  localVideo: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 100,
    height: 100,
  },
  absoluteCenter: {
    position: 'absolute',
    alignSelf: 'center',
  },
});
