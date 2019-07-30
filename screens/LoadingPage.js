import * as React from 'react';
import { Text, View, StyleSheet, Image, ActivityIndicator, StatusBar} from 'react-native';

export default class LoadingPage extends React.Component {
  render() {
    return (
      <View style={{flex: 1,alignItems: 'center',justifyContent: 'center',}}>
        <ActivityIndicator  size="large" color="#D21C44" />
        <StatusBar barStyle="default" backgroundColor = "#D21C44"/>
      </View>
    );
  }
}
