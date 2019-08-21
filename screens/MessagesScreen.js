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
    let photo = this.GetFotoURL(data.sender.foto);
    return (
      <TouchableOpacity
        style = {{borderWidth:0.5, borderColor: '#E5E5E5', padding: 8, margin:8, marginBottom: 0}}
        onPress={this._onPress}>
        <View style={{flexDirection: 'row'}}>
          <View style={{width: '30%', alignItems: 'center', padding: 8}}>
            <Avatar
              size={50}
              rounded
              source={{ uri: data.sender.foto }}
              onPress={() => console.log("Works!")}
              activeOpacity={0.7}
            />
          </View>
          <View style={{width: '70%', height: 75}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{width: '70%', color: '#D21C43',  fontWeight: 'bold'}}>{data.sender.name}</Text>
              <Text style={{width: '30%', fontSize: 8, marginTop: 2}}>{data.lastMessage.date}</Text>
            </View>
            <Text style={{color: 'grey'}}>{data.lastMessage.text}</Text>
          </View>
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
    this.state = {data: [], refreshing: false, errors: '', modalVisible: false};
  }

  componentWillMount() {
    this.setState({data: [], refreshing: false, errors: '', modalVisible: false});
    this._loadAsync();
  }

  shouldComponentUpdate(){

    //if (!this.state.dataIsLoading){
    //    this._loadAsync();
    //  };
      return true;
  }

  _keyExtractor = (item, index) => item.id;

  _onChangeText = (props) => {this.props.navigation.navigate("Dialog", {id: props.id, recipient: {name: props.data.sender.name, url: props.data.sender.foto}})};

  _NewMessageAsync = async () => {this.props.navigation.navigate('CompanyList');}

  _loadAsync = async () => {

    this.setState({refreshing: true});

    let dataJSON  = await GetQueryResult({method: 'GET', url: DIALOG_LIST_URL});

    if (dataJSON['status'] === true) {
      this.setState({data:  dataJSON['dataset'], refreshing: false, text: JSON.stringify(dataJSON)});
    }else{
      this.setState({errors: dataJSON['errors'], refreshing: false, text: JSON.stringify(dataJSON)});
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

    if (this.state.errors.length != 0) {
      return (<ErrorPage mistake={this.state.errors}/>);
    }

    return (
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
          </View>
    );
  }
}

//<TouchableOpacity onPress={this._NewMessageAsync} style={styles.redSection}>
//  <Text style={{color: 'white', marginRight: 8, marginTop: -4}}>Новое сообщение</Text>
//</TouchableOpacity>

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
});
