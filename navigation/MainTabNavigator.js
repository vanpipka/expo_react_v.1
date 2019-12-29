import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GetQueryResult } from '../components/WebAPI';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import Urls from '../constants/Urls';
import TabBarIcon from '../components/TabBarIcon';
import JobsScreen from '../screens/JobsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import HomeScreen from '../screens/HomeScreen';
import AuthLoginScreen from '../screens/AuthLoginScreen';
import SettingsScreen from '../screens/SettingsScreen';

const URI_MESSAGE = Urls.SERVER_URL+Urls.MESSAGES_LIST_URL+'getcount';
const URI_RESPONSES = Urls.SERVER_URL+Urls.RESPONSES_LIST_URL+'getcount';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
},{headerMode: 'none'});

HomeStack.navigationOptions = {
  tabBarLabel: 'Рабочие',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? 'ios-contacts'
          : 'md-contacts'
      }
    />
  ),
};

const JobsStack = createStackNavigator({
  Jobs: JobsScreen,
},{headerMode: 'none'},
);

JobsStack.navigationOptions = {
  tabBarLabel: 'Заказы',
  tabBarIcon: ({ focused }) => (
      <JobsStackIcon
        focused={ focused }
        url ={URI_RESPONSES}
        icon = {Platform.OS === 'ios' ? 'ios-construct' : 'md-construct'}
      />
  ),
};

const MessagesStack = createStackNavigator({
  Messages: MessagesScreen,
},{headerMode: 'none'});

MessagesStack.navigationOptions = {
  tabBarLabel: 'Сообщения',
  tabBarIcon: ({ focused }) => (
    <JobsStackIcon
      focused={ focused }
      url = {URI_MESSAGE}
      icon = {Platform.OS === 'ios' ? 'ios-chatboxes' : 'md-chatboxes'}
    />
  ),
};

const AuthLoginStack = createStackNavigator({
  Settings: AuthLoginScreen,
},{headerMode: 'none'});

AuthLoginStack.navigationOptions = {
  tabBarLabel: 'Настройки',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      tintColor={'red'}
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-contact' : 'md-contact'}
    />
  ),
};

class JobsStackIcon extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {result: 0, focused: props.focused, url: props.url, icon: props.icon};
  };

  componentWillMount() {
    console.log("componentWillMount()");
    this._loadAsync();
  };

  componentWillReceiveProps(nextProps) {
               console.log("componentWillReceiveProps()");
              console.log( nextProps);
           }

          

  _loadAsync = async () => {

    let dataJSON  = await GetQueryResult({method: 'GET', url: this.state.url});

    if (dataJSON['count'] != undefined) {
      this.setState({result:  dataJSON['count']});
    };
  }

  render() {
    return (<View style={{ width: 24, height: 24, margin: 5 }}>
        <TabBarIcon
          focused={this.state.focused}
          name={this.state.icon}
        />
        { this.state.result > 0 && (
        <View
            style={{
              // If you're using react-native < 0.57 overflow outside of parent
              // will not work on Android, see https://git.io/fhLJ8
              position: 'absolute',
              right: -6,
              top: -3,
              backgroundColor: '#D21C43',
              borderRadius: 6,
              width: 14,
              height: 14,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {this.state.result}
            </Text>
          </View>
        )}
      </View>);
    }
};

export default createBottomTabNavigator({
      HomeStack,
      JobsStack,
      MessagesStack,
      AuthLoginStack,
    },{
      tabBarOptions: {
        activeTintColor: '#D21C44',
        style: {backgroundColor: '#575759', borderTopColor: 'black', сolor: 'blue'}
      }
    },);
