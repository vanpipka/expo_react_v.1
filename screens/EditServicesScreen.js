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

import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import Urls from '../constants/Urls';

const API       = Urls.SERVER_URL+Urls.SERVICE_LIST_URL;
const API_SAVE  = Urls.SERVER_URL+Urls.SERVICE_LIST_SAVE_URL;

class MyListItem extends React.PureComponent {

  _onChangeText = (text) => {
    this.props.onChangeText(this.props, text);
  };

  render() {
    return (
      <View style={{borderBottomWidth:1, borderBottomColor: '#C4C4C4'}}>
        <View style={{flexDirection: 'row',}}>
          <View style = {{width:'60%', justifyContent: 'center', padding: 8}}>
            <Text style={{}}>
              {this.props.title}
            </Text>
          </View>
          <View style={{width: '40%', padding: 4}}>
            <TextInput
                style={styles.textInput}
                onChangeText={(text) => this._onChangeText(text)}
                value = {this.props.price}>
            </TextInput>
          </View>
        </View>
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

    this.state = {data: [], dataIsLoading: false, services: navigation.getParam('services', [])};

    this._loadCityAsync();
  }

  _keyExtractor = (item, index) => item.id;

  _onChangeText = (props, text) => {
    //Alert.alert(text)

    let data = this.state.data;

    data.forEach(function(item, i) {

      if (item['id'] === props.id) {
          item['price'] = text.replace(/[^0-9]/g, '');
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

        let price = '';

        this.state.services.forEach(function(itemService, i) {

          if (itemService['id'] === item.id) {
              //Alert.alert('eeee')
              price = itemService['price'];
          };
        });

        return ({title: item.name, id: item.id, price: price})
      });

      this.setState({data:  result, dataIsLoading: true});

    }

  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        onChangeText = {this._onChangeText}
        title={item.title}
        price={String(item.price)}
      />
    );

  _saveServicesAsync = async () => {
      const { navigation } = this.props;

      let servicesArray = [];

      this.state.data.map((item, index) => {

        try {
            let value = Number(item.price);
            servicesArray.push({id: item.id, service: item.title, price: value})
        } catch (e) {

        }
      });

      navigation.state.params.onGoBack({services: servicesArray});
      navigation.goBack();

    }

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
                <Text style={{color: '#0C5460'}}>Введите часовую ставку в рублях по указанным услугам что бы работодатель мог быстрее найти вас в поиске</Text>
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
