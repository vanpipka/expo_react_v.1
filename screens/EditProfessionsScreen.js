import Autocomplete from '../components/Autocomplete';
import React, { Component } from 'react';
import {
  StyleSheet,
  AsyncStorage,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';

import { CheckBox } from 'react-native-elements';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import Urls from '../constants/Urls';

const API       = Urls.SERVER_URL+Urls.PROFESSION_LIST_URL;
const API_SAVE  = Urls.SERVER_URL+Urls.PROFESSION_LIST_SAVE_URL;

class MyListItem extends React.PureComponent {

  _setBooleanState = () => {
    this.props.SetBooleanState(this.props);
  };

  render() {
    return (
      <View style={{borderBottomWidth:1, borderBottomColor: '#C4C4C4'}}>
          <CheckBox
            title = {this.props.title}
            checked={this.props.value}
            checkedColor = {'#D21C43'}
            onPress={() => this._setBooleanState()}
            containerStyle={{borderColor:'white'}}
          />
      </View>
    );
  }
}

export default class LinksScreen extends React.Component {

  static navigationOptions = {
    title: 'Услуги и цены',
  };

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    this.state = {data: [], dataIsLoading: false, professions: navigation.getParam('professions', [])};

    this._loadCityAsync();
  }

  _keyExtractor = (item, index) => item.id;

  _onChangeText = (props, text) => {
    //Alert.alert(text)

    let data = this.state.data;

    data.forEach(function(item, i) {

      if (item['id'] === props.id) {
          item['value'] = !item['value'];
      };
    });

    this.setState({data: data});
  };

  _loadCityAsync = async () => {

    let url = this.state.url;
    if (url === ''){
      this.setState({dataIsLoading: true,})
    }
    else {
      let data = '';
      try {
        let response = await fetch(API);
        data = await response.text();
        if (Platform.OS === 'android') {
          data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
        }
      } catch (error) {
          this.setState({dataIsLoading: true});
      }

      result = JSON.parse(data).dataset.map((item, index) => {

        let value = false;

        this.state.professions.forEach(function(itemService, i) {
          if (itemService['id'] === item.id) {
              value = true;
          };
        });

        return ({title: item.name, id: item.id, value: value})
      });

      this.setState({data:  result, dataIsLoading: true});

    }

  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        SetBooleanState = {this._onChangeText}
        title={item.title}
        value={item.value}
      />
    );

  _saveServicesAsync = async () => {
      const { navigation } = this.props;

      let professionsArray = [];

      this.state.data.map((item, index) => {
        if (item.value === true) {
          professionsArray.push({id: item.id, name: item.title})
        }
      });

      navigation.state.params.onGoBack({professions: professionsArray});
      navigation.goBack();

    }

  _onChangeText = (props) => {

    let data = this.state.data;

    data.forEach(function(item, i) {

      if (item['id'] === props.id) {
          item['value'] = !item['value'];
      };
    });

    this.setState({data: data});

  };

  render() {

    if (!this.state.dataIsLoading) {
      return (<LoadingPage/>);
    }

    //const { goBack } = this.props.navigation;
    const { navigation } = this.props;

    return (
      <KeyboardAvoidingView style={{flex: 1}} behavior="padding"  keyboardVerticalOffset={80} enabled>
          <View style={styles.container}>
            <View style={{backgroundColor: '#D1ECF1', padding: 8, borderBottomWidth:1, borderBottomColor: '#C4C4C4'}}>
                <Text style={{color: '#0C5460'}}>Укажите полный перечень своих трудовых компетенций что бы работодатель мог быстрее найти вас в поиске</Text>
            </View>
            <FlatList
              data={this.state.data}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
            <TouchableOpacity style={styles.redSection} onPress={this._saveServicesAsync}>
              <Text style={{color: 'white'}}>СОХРАНИТЬ</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
  },

  textInput: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    width: '100%',
  },

  redSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D21C43',
    height: 40,
  },

});
