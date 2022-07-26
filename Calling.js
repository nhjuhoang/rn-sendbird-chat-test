import React from 'react';
import {View, StyleSheet, Text, Button, TouchableOpacity} from 'react-native';
import {SendBirdCallsVideo, SendBirdCalls} from 'react-native-sendbird-calls';

export default function Calling({
  callInfo,
  endCall,
}: {
  callInfo: {
    calling: boolean,
    callId: string,
    isVideoCall: boolean,
    connected: boolean,
    isLocalAudioEnabled: boolean,
    isLocalVideoEnabled: boolean,
    isRemoteAudioEnabled: boolean,
    isRemoteVideoEnabled: boolean,
  },
  endCall: () => void,
}) {
  const {callId, isVideoCall, connected, isLocalAudioEnabled} = callInfo || {};

  const changeMuteMicrophone = () => {
    if (isLocalAudioEnabled) {
      SendBirdCalls.muteMicrophone();
    } else {
      SendBirdCalls.unmuteMicrophone();
    }
  };

  const switchCamera = () => {
    SendBirdCalls.switchCamera();
  };

  const renderCallConnecting = () => {
    return (
      <View style={styles.container}>
        {callId && isVideoCall ? (
          <View style={styles.container}>
            <SendBirdCallsVideo
              callId={callId}
              local={true}
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
              style={styles.remoteVideo}
            />
            <SendBirdCallsVideo
              callId={callId}
              local={true}
              style={styles.localVideo}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 20,
                alignSelf: 'center',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'red'}]}
                onPress={endCall}>
                <Text style={{color: 'white'}}>End call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'blue'}]}
                onPress={changeMuteMicrophone}>
                <Text style={{color: 'white'}}>
                  {isLocalAudioEnabled ? 'Mute' : 'UnMute'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'blue'}]}
                onPress={switchCamera}>
                <Text style={{color: 'white'}}>switchCamera</Text>
              </TouchableOpacity>
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
    width: 120,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  absoluteCenter: {
    position: 'absolute',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: 'red',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
