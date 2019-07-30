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
} from 'react-native';

import { GetQueryResult } from '../components/WebAPI';
import { GiftedChat } from 'react-native-gifted-chat';
import { Icon, Avatar } from 'react-native-elements';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import CompanysPage from '../screens/CompanyList';
import DialogScreen from '../screens/DialogScreen';
import Urls from '../constants/Urls';

import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

const DIALOG_LIST_URL = Urls.SERVER_URL+Urls.DIALOG_LIST_URL;

class MyListItem extends React.PureComponent {

  _onPress = () => {
    this.props.onChangeText(this.props);
  };

  render() {
    let data = this.props.data;
    let photo = this.GetFotoURL(data.foto);
    return (
      <TouchableOpacity
        style = {{borderWidth:0.5, borderColor: '#C4C4C4', padding: 8, margin:8}}
        onPress={this._onPress}>
        <View style={{flexDirection: 'row'}}>
          <View style={{width: '30%', alignItems: 'center', padding: 8}}>
            <ImageBackground style={{width: '100%',}} source={photo} resizeMode='contain'>
              <View style={{width: '100%', height: 100}}>

              </View>
            </ImageBackground>
          </View>
          <Text style={{color: '#D21C43', width: '70%'}}>{data.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  GetFotoURL(url){

    if (url == '/static/main/img/add-photo.png'){
        return (require('../images/nofoto.png'))
    }
    return (photoSource = {uri: url})
  }

}

export class MessagesScreen extends React.Component {

  static navigationOptions = {
    title: 'Диалоги',
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {data: [], dataIsLoading: false, errors: '', modalVisible: false};
  }

  componentWillMount() {
    this.setState({data: [], dataIsLoading: false, errors: '', modalVisible: false});
    this._loadAsync();
  }

  shouldComponentUpdate(){

    //if (!this.state.dataIsLoading){
    //    this._loadAsync();
    //  };
      return true;
  }

  _keyExtractor = (item, index) => item.id;

  _onChangeText = (props) => {this.props.navigation.navigate("Dialog", {id: props.id, name: props.data.name, fotourl: props.data.foto})};

  _NewMessageAsync = async () => {this.props.navigation.navigate('CompanyList');}

  _loadAsync = async () => {

    let dataJSON  = await GetQueryResult({method: 'GET', url: DIALOG_LIST_URL});

    if (dataJSON['status'] === true) {
      this.setState({data:  dataJSON['dataset'], dataIsLoading: true});
    }else{
      this.setState({errors: dataJSON['errors'], dataIsLoading: true});
    };
  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        data = {item}
        onChangeText = {this._onChangeText}
      />
    );

  render() {

    return (
          <View style={styles.container}>
            <FlatList
              data={this.state.data}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
            <TouchableOpacity style={styles.fabMenuStyle}
              onPress={() => {this.setState({dataIsLoading: false,}); this._loadAsync()}}>
              <Icon
                reverse
                size={20}
                name='md-sync'
                type='ionicon'
                color='#D21C43'
                />
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabMenuStyle1}
              onPress={() => {this.setState({dataIsLoading: false,}); this._NewMessageAsync()}}>
              <Icon
                reverse
                size={20}
                name='md-add-circle-outline'
                type='ionicon'
                color='#D21C43'
                />
            </TouchableOpacity>
          </View>
    );
  }
}

class AuthLoadingScreen extends React.Component {

  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    this.props.navigation.navigate('Home');
  };

  // Render any loading content that you like here
  render() {
    return (
      <LoadingPage/>
    );
  }
}
const AppStack = createStackNavigator({ Home: MessagesScreen, CompanyList: CompanysPage, Dialog: DialogScreen});

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));

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

  redbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D21C43',
    height: 40,
    borderColor: 'black',
    borderWidth: 0.3,
    margin: 8,
  },

  fabMenuStyle: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: '#D21C43',
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 0.5,
    bottom: 8,
    right: 8,
    justifyContent: 'flex-end'
  },

  fabMenuStyle1: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: '#D21C43',
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 0.5,
    bottom: 68,
    right: 8,
    justifyContent: 'flex-end'
  }

});
