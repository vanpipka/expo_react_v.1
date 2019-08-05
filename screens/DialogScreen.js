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
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';

import { GetQueryResult } from '../components/WebAPI';
import { Icon, Avatar } from 'react-native-elements';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import CompanysPage from '../screens/CompanyList';
import Urls from '../constants/Urls';

import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

const DIALOG_LIST_URL = Urls.SERVER_URL+Urls.DIALOG_LIST_URL+'?id=';

class LogoTitle extends React.Component {

  render() {
    return (
      <View style={{flexDirection: 'row'}}>
        <Image
          source={{uri: this.props.recipient.url}}
          style={{ width: 30, height: 30 }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 20, paddingLeft: 8 }}>
          {this.props.recipient.name}
        </Text>
      </View>
    );
  }
}

class MyListItem extends React.PureComponent {

  render() {
    let data = this.props.data;
    let color = data.itsMe ? 'red': 'green';

    return (
      <View style={data.itsMe ? {alignItems: 'flex-end'} : {alignItems: 'flex-start'}}>
          <View style={data.itsMe ? styles.rightMessage : styles.leftMessage}>
            <Text multiline = {true}>{data.text}</Text>
            <View style = {{width: '100%', alignItems: 'flex-end'}}>
              <Text style={{fontSize: 8, marginTop: 2}}>{data.created}</Text>
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

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {data: [], refreshing: false, errors: [], id: navigation.getParam('id', '')};
  }

  componentWillMount() {
    this._loadAsync();
  }

  _keyExtractor = (item, index) => item.id;

  _loadAsync = async () => {

      this.setState({refreshing: true});
      let dataJSON  = await GetQueryResult({method: 'GET', url: DIALOG_LIST_URL+this.state.id});

      if (dataJSON['status'] === true) {
        this.setState({data:  dataJSON['messageList'], refreshing: false, text: JSON.stringify(dataJSON)});
      }else{
        this.setState({errors: dataJSON['errors'], refreshing: false, text: JSON.stringify(dataJSON)});
      };

  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        data = {item}
      />
    );

  _sendMessageAsync = async () => {

      if (this.state.message == ''){
        return;
      }

      this.setState({refreshing: true})

      let data = JSON.stringify({dialogID: this.state.id, message: this.state.message})

      let body = encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken')
           +'&'+ encodeURIComponent('data') + '=' + data;

      let dataJSON  = await GetQueryResult({method: 'POST', url: DIALOG_LIST_URL, body: body});

      if (dataJSON['status'] === true) {

        let dataArray = this.state.data;
        dataArray.push({id:'', text: dataJSON.message.text, created: dataJSON.message.created, itsMe: true})
        this.setState({data:  dataArray, message : '', errors: '', refreshing: false});
      }
      else{

        this.setState({errors: dataJSON['errors'], refreshing: false});
      }
  }

  GetFotoURL(url){

      if (url == '/static/main/img/add-photo.png'){
          return (require('../images/nofoto.png'))
      }

      return (photoSource = {uri: Urls.SERVER_URL+url})
  }

  render() {

    //const { goBack } = this.props.navigation;
    const { navigation } = this.props;

    let photo = this.GetFotoURL(this.state.fotourl);
    let errors = null;

    if (this.state.errors != ''){
        errors = <View style = {{paddingLeft: 8}}>
                    <Text multiline = {true} style = {{color: 'red'}}>{this.state.errors}</Text>
                  </View>
    }
    /*            */
    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior="padding"  keyboardVerticalOffset={80} enabled>
          <View style={styles.container}>
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
            {errors}
              <View style = {styles.greySection}>
                <TextInput
                  style={styles.textInput}
                  onChangeText={(message) => this.setState({message})}
                  value={this.state.message}
                  placeholder = 'Введите сообщение'
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={this._sendMessageAsync}>
                  <Text style={{color: 'grey'}}>Отправить</Text>
                </TouchableOpacity>
              </View>
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

  rightMessage: {
    backgroundColor: '#cce5ff',
    borderColor: '#b8daff',
    color: '#004085',
    borderWidth:0.5,
    padding: 8,
    margin:8,
    width: '60%'
  },

  leftMessage: {
    backgroundColor: '#e2e3e5',
    borderColor: '#d6d8db',
    color: '#383d41',
    borderWidth:0.5,
    padding: 8,
    margin:8,
    width: '60%'
  },

  textInput: {
    backgroundColor: 'white',
    height: 40,
    borderColor: '#d6d8db',
    borderWidth: 0.5,
    paddingLeft: 8,
    width: '70%',
  },

  greySection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e3e5',
    borderTopWidth: 0.5,
    borderTopColor: '#d6d8db',
    height: 56,
    flexDirection: 'row',
    paddingLeft: 8,
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },

});
