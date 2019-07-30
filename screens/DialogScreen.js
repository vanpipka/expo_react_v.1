import Autocomplete from '../components/Autocomplete';
import React, { Component } from 'react';
import {
  StyleSheet,
  AsyncStorage,
  Platform,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Modal,
  ScrollView,
  ImageBackground,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  Image
} from 'react-native';

import { GetQueryResult } from '../components/WebAPI';
import { Icon, Avatar } from 'react-native-elements';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import CompanysPage from '../screens/CompanyList';
import Urls from '../constants/Urls';

import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

const API       = Urls.SERVER_URL+Urls.DIALOG_LIST_URL+'?id=';
const API_SAVE  = Urls.SERVER_URL+Urls.MESSAGE_SEND_URL;

class LogoTitle extends React.Component {

  render() {
    return (
      <View style={{flexDirection: 'row'}}>
        <Image
          source={{uri: this.props.recipient.url}}
          style={{ width: 30, height: 30 }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
          {this.props.recipient.name}
        </Text>
      </View>
    );
  }
}

class MyListItem extends React.PureComponent {

  render() {
    let data = this.props.data;
    return (
      <View style={{borderWidth:0.5, borderColor: '#E5E5E5', padding: 8, margin:8}}>
        <View style={{flexDirection: 'row'}}>
          <View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{width: '70%', fontWeight: 'bold'}}>{data.theme}</Text>
              <Text style={{width: '30%', fontSize: 12, color: 'grey', marginTop: 2}}>{data.date.substring(0,10)}</Text>
            </View>
            <Text style={{color: 'grey'}}>{data.text}</Text>
          </View>
        </View>
      </View>
    );
  }

}

export default class MessagesScreen extends React.Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;
    return {
          headerTitle: <LogoTitle recipient = {params.recipient}/>
        };
  };

      /* render function, etc */

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    const id = navigation.getParam('id', '');
    const name = navigation.getParam('name', '');
    const fotourl = navigation.getParam('fotourl', '');

    this.state = {data: [], refreshing: false, errors: [], id: id};
  }

  componentWillMount() {
    this._loadAsync();
  }

  _keyExtractor = (item, index) => item.id;

  _loadAsync = async () => {

      this.setState({refreshing: true});

      let dataJSON  = await GetQueryResult({method: 'GET', url: API+this.state.id});

      this.setState({refreshing: false, text: JSON.stringify(dataJSON)});

      //if (dataJSON['status'] === true) {
      //  this.setState({data:  dataJSON['dataset'], refreshing: false, text: JSON.stringify(dataJSON)});
      //}else{
      //  this.setState({errors: dataJSON['errors'], refreshing: false, text: JSON.stringify(dataJSON)});
      //};

      //let dataJSON  = await GetQueryResult({method: 'POST', url: API, body: body});

      //if (dataJSON['status'] === true) {

      //  this.setState({data:  dataJSON['dataset'], refreshing: true});
      //}
      //else{
      //  this.setState({errors: dataJSON['errors'], refreshing: true});
      //}

  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        data = {item}
        title={item.description}
      />
    );

  _saveMessageAsync = async () => {
      const { navigation } = this.props;

      if (this.state.message == ''){
        return;
      }

      let headers = {};

      headers["X-Requested-With"] = "XMLHttpRequest";
      headers["Cookie"] = 'csrftoken='+await AsyncStorage.getItem('csrftoken')+'; '+'sessionid='+await AsyncStorage.getItem('sessionid');
      headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      headers["Accept-Encoding"] = "gzip, deflate",
      headers["Accept-Language"] = "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
      headers["Cache-Control"] =	"max-age=0",
      headers["Connection"] = "keep-alive",
      headers["Content-Type"] = "application/x-www-form-urlencoded",
      headers["Upgrade-Insecure-Requests"] = "1",
      headers["User-Agent"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      headers["withCredentials"] = true;
      headers['Cache-Control'] = 'no-cache';

      let body = encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken')
           +'&'+ encodeURIComponent('data') + '=' + JSON.stringify({resipient_type: '2', resipient_id: this.state.id, theme: '', text: this.state.message});

      let data = '';
      try {
        let response = await fetch(API_SAVE, {method: 'POST', body: body, headers: headers});
        data = await response.text();
        if (Platform.OS === 'android') {
          data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
        }
      } catch (error) {
          this.setState({dataIsLoading: true});
          return;
      }

      let dataJSON = JSON.parse(data);

      if (dataJSON['status'] === true) {

        let dataArray = this.state.data;

        dataArray.unshift({id:'', text: this.state.message, theme: '', date: 'только что'})

        this.setState({data:  dataArray, message : ''});
      }
      else{

        this.setState({errors: dataJSON['errors'], dataIsLoading: true});
      }

        /*let servicesArray = [];

        this.state.data.map((item, index) => {

          try {
              let value = Number(item.price);
              servicesArray.push({id: item.id, service: item.title, price: value})
          } catch (e) {

          }
        });

        navigation.state.params.onGoBack({services: servicesArray});
        navigation.goBack();*/

  }

  GetFotoURL(url){

      if (url == '/static/main/img/add-photo.png'){
          return (require('../images/nofoto.png'))
      }

      const API = Urls.SERVER_URL+url;

      return (photoSource = {uri: API})
  }

  render() {

    //const { goBack } = this.props.navigation;
    const { navigation } = this.props;

    let photo = this.GetFotoURL(this.state.fotourl);
    /*            */
    return (
          <View style={styles.container}>
            <Text multiline={true}>
                {this.state.text}
            </Text>
            <FlatList
              data={this.state.data}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._loadAsync}
                />
              }
            />
            <View style = {styles.redSection}>
              <TextInput
                style={styles.textInput}
                onChangeText={(message) => this.setState({message})}
                value={this.state.message}
                placeholder = 'Введите ссобщение'
              />
              <TouchableOpacity
                style={styles.redButton}
                onPress={this._saveMessageAsync}>
                <Text style={{color: 'white'}}>Отправить</Text>
              </TouchableOpacity>
            </View>
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
    width: '70%',
  },

  redSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C4C4C4',
    height: 60,
    flexDirection: 'row',
  },

  redbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D21C43',
    height: 40,
    borderColor: 'black',
    borderWidth: 0.3,
    width: '30%',
  },

  fabMenuStyle: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: '#D21C43',
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 0.5,
    bottom: 68,
    right: 8,
    justifyContent: 'flex-end'
  },


});
