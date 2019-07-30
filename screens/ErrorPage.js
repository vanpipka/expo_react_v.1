import * as React from 'react';
import { Text, View, StyleSheet, Image, ActivityIndicator, StatusBar} from 'react-native';

export default class LoadingPage extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={{color: 'grey'}}>Ошибочка...</Text>
        <Text style={{color: 'red'}}>{this.props.mistake}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
