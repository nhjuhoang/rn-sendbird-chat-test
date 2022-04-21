import React from 'react';
import {Button, StyleSheet, Text, View, TextInput} from 'react-native';

export default function CallScreen({
  caller,
  onLogout,
  onCall,
}: {
  caller: Object,
  onLogout: () => void,
  onCall: () => void,
}) {
  const [userId, setUserId] = React.useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Signed in user: #{caller?.userId} {caller?.nickname}
        <Button title={`Logout #${caller?.userId}`} onPress={onLogout} />
      </Text>
      <TextInput
        value={userId}
        style={styles.input}
        onChangeText={txt => setUserId(txt)}
        placeholder="User ID to call"
      />
      <View style={{flexDirection: 'row'}}>
        <Button
          color={'green'}
          title={'Video call'}
          onPress={() => onCall(userId, true)}
        />
        <Button
          color={'blue'}
          title={'Voice call'}
          onPress={() => onCall(userId, false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  calling: {},
  input: {
    height: 40,
    backgroundColor: '#e2e2e2',
    marginVertical: 10,
    borderRadius: 5,
    padding: 10,
  },
  fixToText: {
    margin: 10,
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
  },
});
