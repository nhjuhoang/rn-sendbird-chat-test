import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';

type Props = {};

export default function IncomingCall({
  callInfo,
  endCall,
  acceptCall,
}: {
  callInfo: {
    calling: boolean,
    callId: string,
    isVideoCall: boolean,
    connected: boolean,
  },
  endCall: () => void,
  acceptCall: () => void,
}) {
  const caller = callInfo?.caller || '';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text
          style={
            styles.txtTitle
          }>{`Cuộc gọi đến từ khứa ${caller?.nickname}`}</Text>
      </View>
      <View style={styles.btns}>
        <TouchableOpacity style={styles.button} onPress={endCall}>
          <Text style={styles.txtCancel}>DEO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: 'green'}]}
          onPress={acceptCall}>
          <Text style={styles.txtAccept}>NGHE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'skyblue',
  },
  txtCancel: {
    color: 'white',
    fontWeight: '900',
  },
  txtAccept: {
    color: 'white',
    fontWeight: '900',
  },
  button: {
    backgroundColor: 'red',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btns: {
    justifyContent: 'space-between',
    marginHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  content: {
    flex: 1,
    paddingTop: 200,
    alignItems: 'center',
  },
  txtTitle: {
    fontWeight: '900',
    color: 'black',
  },
});
