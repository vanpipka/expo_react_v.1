import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import JobsScreen from '../screens/JobsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import HomeScreen from '../screens/HomeScreen';
import AuthLoginScreen from '../screens/AuthLoginScreen';
import SettingsScreen from '../screens/SettingsScreen';

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
          ? `ios-contacts${focused ? '' : '-outline'}`
          : 'md-contacts'
      }
    />
  ),
};

const JobsStack = createStackNavigator({
  Jobs: JobsScreen,
},{headerMode: 'none'});

JobsStack.navigationOptions = {
  tabBarLabel: 'Заказы',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-construct' : 'md-construct'}
    />
  ),
};

const MessagesStack = createStackNavigator({
  Messages: MessagesScreen,
},{headerMode: 'none'});

MessagesStack.navigationOptions = {
  tabBarLabel: 'Сообщения',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-chatboxes' : 'md-chatboxes'}
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
