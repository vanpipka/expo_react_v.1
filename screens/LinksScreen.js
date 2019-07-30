import Autocomplete from '../components/Autocomplete';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { CheckBox, ButtonGroup } from 'react-native-elements';


export default class LinksScreen extends React.Component {

  static navigationOptions = {
    title: 'Город',
  };

  constructor () {
    super()
    this.state = {
      selectedIndex: 2,
    }
    this.updateIndex = this.updateIndex.bind(this)
  }

  updateIndex (selectedIndex) {

    Alert.alert(String(selectedIndex.groupName));
    //this.setState({selectedIndex})
  }

  render () {
    const buttons = ['Hello', 'World', 'Buttons']
    const { selectedIndex } = this.state;

    Alert.alert(String(selectedIndex));

    return (<View>
      <ButtonGroup
        onPress={this.updateIndex}
        groupName = {'вася'}
        selectedIndex={selectedIndex}
        buttons={buttons}
        containerStyle={{height: 100}}
      />
      <ButtonGroup
        onPress={this.updateIndex}
        groupName = {'Петя'}
        selectedIndex={selectedIndex}
        buttons={buttons}
        containerStyle={{height: 100}}
      />
      </View>
    )
  }


}
