import * as React from 'react';
import { Text, View, StyleSheet, Image, ActivityIndicator, StatusBar, TouchableOpacity} from 'react-native';
import { NavigationEvents, NavigationActions } from 'react-navigation';

export default class LoadingPage extends React.Component {

  _willFocus = (props) => {
      console.log('willFocus error page');

      if (this.props.willFocus != undefined) {
        this.props.willFocus(this.props);
      };
  };

  _goAuthLoginStack = (props) => {

      if (this.props.goAuthLoginStack != undefined) {
        this.props.goAuthLoginStack(this.props);
      };
  };

  render() {

    let button = null;

    if (this.props.mistake == 'Доступ запрещен') {
        button = <View style = {{alignItems: 'center', width:'80%'}}>
                  <Text style={{color: 'grey'}}>Для просмотра данного раздела</Text>
                  <Text style={{color: 'grey'}}>необходимо авторизоваться в приложении</Text>
                  <TouchableOpacity
                        style={styles.redbutton}
                        onPress = {this._goAuthLoginStack}>
                        <Text style={{color: 'white', fontWeight: 'bold',}}>Войти</Text>
                  </TouchableOpacity>
                </View>
    };

    return (
      <View style={styles.container}>
        <Text style={{color: 'grey'}}></Text>
        <Text style={{color: 'red'}}>{this.props.mistake}</Text>
        <NavigationEvents
          onWillFocus={this._willFocus}
        />
        {button}
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
  redbutton: {
    width: 100,
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: '#D21C43',
    height: 40,
    borderColor: 'black',
    borderWidth: 0.3,
    justifyContent: 'center',
  },
});
