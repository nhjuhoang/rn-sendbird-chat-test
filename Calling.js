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

  return (
    <View style={styles.container}>
      {connected ? (
        <View style={styles.container}>
          {callId && isVideoCall ? (
            <View style={styles.container}>
              <SendBirdCallsVideo
                call={{callId: callId, local: false}}
                style={styles.remoteVideo}
              />
              <SendBirdCallsVideo
                call={{callId: callId, local: true}}
                style={styles.localVideo}
              />
              <View>
                <Text>Calling...</Text>
                <Button title={'End call'} onPress={endCall} />
              </View>
            </View>
          ) : (
            <View>
              <Text>Connected (00:01...)</Text>
              <Button title={'End call'} onPress={endCall} />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.container}>
          {callId && isVideoCall ? (
            <View style={styles.container}>
              <SendBirdCallsVideo
                call={{callId: callId, local: true}}
                style={styles.remoteVideo}
              />
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                }}>
                <Text>Calling...</Text>
                <Button title={'End call'} onPress={this.endCall} />
              </View>
            </View>
          ) : (
            <View style={styles.container}>
              <Text>Calling...</Text>
              <Button title={'End call'} onPress={this.endCall} />
            </View>
          )}
        </View>
      )}
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
});
