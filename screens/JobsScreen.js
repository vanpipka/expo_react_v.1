
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
  TextInput,
  FlatList,
  Alert,
} from 'react-native';

import { GetQueryResult } from '../components/WebAPI';
import { Icon } from 'react-native-elements';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import Urls from '../constants/Urls';
import Autocomplete from '../components/Autocomplete';

import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

const JOB_LIST_URL  = Urls.SERVER_URL+Urls.JOB_LIST_URL;
const API_SAVE      = Urls.SERVER_URL+Urls.SERVICE_LIST_SAVE_URL;

export class JobsScreen extends React.Component {

  static navigationOptions = {
    title: 'Заказы',
  };

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    this.state = {data: [], dataIsLoading: false, errors: [], modalVisible: false};

    this._loadAsync();
  }

  _keyExtractor = (item, index) => item.id;

  _onChangeText = (props, text) => {
    Alert.alert(text)
  };

  _loadAsync = async () => {

    let dataJSON  = await GetQueryResult({method: 'GET', url: JOB_LIST_URL});

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
        title={item.description}
      />
    );

  _saveServicesAsync = async () => {
      const { navigation } = this.props;

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

  render() {

    if (!this.state.dataIsLoading) {
      return (<LoadingPage/>);
    }
    else if (this.state.errors.length != 0) {
      return (<ErrorPage mistake={this.state.errors}/>);
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
          </View>
    );
    /*<TouchableOpacity style={styles.redSection} onPress={this._saveServicesAsync}>
      <Text style={{color: 'white'}}>ПРОДОЛЖИТЬ</Text>
    </TouchableOpacity>*/
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

class MyListItem extends React.PureComponent {

  _onChangeText = (text) => {
    this.props.onChangeText(this.props, text);
  };

  render() {
    let data = this.props.data;
    let button = null;
    let article = null;
    let jobComposition = null;

    if (data.job_composition.length == 0) {
      jobComposition = <View  style={{marginLeft: 8, marginRight: 8}}>
                          <Text style={{color: '#C4C4C4'}}>Нет данных о требующихся мастерах</Text>
                      </View>
    }
    else {
      jobComposition = data.job_composition.map((item, index) => {
        return(
          <View key={index} style={{flexDirection: 'row', flex: 1,flexGrow: 1, marginLeft: 8, marginRight: 8}}>
            <Text>{item.profession__name}</Text>
            <View style={{marginLeft:4, marginRight:4, marginBottom:8, flexGrow: 1,borderBottomWidth:0.5, borderStyle: 'dotted', borderBottomColor: '#C4C4C4'}}/>
            <Text>{item.count}</Text><Text style={{color: '#C4C4C4'}}> чел. /</Text>
            <Text>{item.price}</Text><Text style={{color: '#C4C4C4'}}> руб.</Text>
          </View>
        )
      });
    }
    if (data.response_is_available == 1){
        button = <TouchableOpacity style={styles.redbutton}><Text style={{color: 'white'}}>Откликнуться</Text></TouchableOpacity>
    }
    else if (data.response_is_available == 0) {
        article = <View style={{flexDirection: 'row'}}>
                    <Icon name='grade'color='#95CCA2'/>
                    <Text style={{fontSize: 12, color: 'grey', marginTop: -2}}>Вы откликались на этот заказ</Text>
                </View>
    }

    return (
      <View style={{borderWidth:0.5, borderColor: '#C4C4C4', padding: 8, margin:8}}>
        {article}
        <View style={{flexDirection: 'row'}}>
          <Text style={{width: '40%', color: 'grey'}}>Город</Text>
          <Text style={{width: '60%'}}>{data.city__name}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{width: '40%', color: 'grey'}}>Дата проведения</Text>
          <Text style={{width: '60%'}}>{data.date.substring(0,10)}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{width: '40%', color: 'grey'}}>Описание</Text>
          <Text style={{width: '60%'}}>{data.description}</Text>
        </View>
        <View>
          <Text style={{width: '40%', color: 'grey'}}>Требуются</Text>
          {jobComposition}
        </View>
        {button}
        <View style={{flexDirection: 'row', borderTopColor: '#C4C4C4', marginTop: 8, borderTopWidth: 0.5, justifyContent: 'flex-end'}}>
          <Text style={{fontSize:10, color: 'grey'}}>{data.company__name} | </Text>
          <Text style={{fontSize:10, color: 'grey'}}>{data.created.substring(0,10)}</Text>
        </View>
      </View>
    );
  }
}

const AppStack = createStackNavigator({ Home: JobsScreen,});

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
  }

});
