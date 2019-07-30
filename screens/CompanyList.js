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
  ImageBackground,
} from 'react-native';

import { CheckBox } from 'react-native-elements';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import Urls from '../constants/Urls';

const API       = Urls.SERVER_URL+Urls.COMPANY_LIST_URL;

class MyListItem extends React.PureComponent {

  _onPress = () => {
    this.props.OnChangeItem(this.props);
  };

  render() {

    //let data = this.props.data;
    let photo = this.GetFotoURL(this.props.value);

    return (
      <View style={{borderBottomWidth:1, borderBottomColor: '#C4C4C4'}}>
        <TouchableOpacity onPress={this._onPress} style={{margin:8, flexDirection: 'row'}}>
          <ImageBackground style={{width: 40,}} source={photo} resizeMode='contain'>
            <View style={{width: 40, height: 40}}>

            </View>
          </ImageBackground>
          <View style={{height: 40, justifyContent: 'center', }}>
            <Text style={{  }}>
              {this.props.title}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  GetFotoURL(url){

    if (url == '/static/main/img/add-photo.png'){
        return (require('../images/nofoto.png'))
    }

    const API = Urls.SERVER_URL+url;

    return (photoSource = {uri: API})
  }
}

export default class LinksScreen extends React.Component {

  static navigationOptions = {
    title: 'Выбор получателя',
  };

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    this.state = {data: [], dataIsLoading: false,};

    this._loadCityAsync();
  }

  _keyExtractor = (item, index) => item.id;

  _onChangeItem = (props) => {

    this.props.navigation.navigate("Dialog", {id: props.id, name: props.title, fotourl: props.value})

  };

  _loadCityAsync = async () => {

    let url = this.state.url;
    if (url === ''){
      this.setState({dataIsLoading: true,})
    }
    else {

      let headers = {};

      headers["X-Requested-With"] = "XMLHttpRequest";

      let data = '';
      try {
        let response = await fetch(API,{headers: headers});
        data = await response.text();
        if (Platform.OS === 'android') {
          data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
        }
      } catch (error) {
          this.setState({dataIsLoading: true});
      }

      result = JSON.parse(data).dataset.map((item, index) => {
        return ({title: item.name, id: item.id, fotourl: item.resizefotourl})
      });

      this.setState({data:  result, dataIsLoading: true});

    }

  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        OnChangeItem = {this._onChangeItem}
        title={item.title}
        value={item.fotourl}
      />
    );

  _saveServicesAsync = async () => {
      const { navigation } = this.props;

      /*let professionsArray = [];

      this.state.data.map((item, index) => {
        if (item.value === true) {
          professionsArray.push({id: item.id, name: item.title})
        }
      });

      navigation.state.params.onGoBack({professions: professionsArray});
      navigation.goBack();*/

    }

  _onChangeText = (props) => {

    /*let data = this.state.data;

    data.forEach(function(item, i) {

      if (item['id'] === props.id) {
          item['value'] = !item['value'];
      };
    });

    this.setState({data: data});*/

  };

  render() {

    if (!this.state.dataIsLoading) {
      return (<LoadingPage/>);
    }

    //const { goBack } = this.props.navigation;
    const { navigation } = this.props;

    return (
          <View style={styles.container}>
            <FlatList
              data={this.state.data}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          </View>
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
