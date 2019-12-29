
import React, { Component } from 'react';
import {
  StyleSheet,
  AsyncStorage,
  Platform,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { GetQueryResult } from '../components/WebAPI';
import { Icon, Overlay, Button, Badge, Divider } from 'react-native-elements';
import { Avatar } from 'react-native-paper';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import AuthLoginScreen from '../screens/AuthLoginScreen';
import Urls from '../constants/Urls';
import Colors from '../constants/Colors';
import Autocomplete from '../components/Autocomplete';

import { createStackNavigator, createSwitchNavigator, createAppContainer, NavigationEvents } from 'react-navigation';

const JOB_LIST_URL  = Urls.SERVER_URL+Urls.JOB_LIST_URL;
const JOB_SAVE_URL  = Urls.SERVER_URL+Urls.JOB_SAVE_URL;
export class JobsScreen extends React.Component {

  static navigationOptions = {
    title: 'Заказы',
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {data: [], refreshing: false, errors: [], modalVisible: false, sendingAnswer: false, responseText: '', currentOffer: {}};
  }

  componentWillMount() {
    this._loadAsync();
  }

  _respondToTheOffer = async (props) => {

    let result = {refreshing: false, sendingAnswer: false};

    this.setState({sendingAnswer: true});

    if (this.state.currentOffer.id) {

      let data = JSON.stringify({job_id: this.state.currentOffer.id, job_description: this.state.responseText})

      let body = encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken')
           +'&'+ encodeURIComponent('data') + '=' + data;

      let dataJSON  = await GetQueryResult({method: 'POST', url: JOB_SAVE_URL, body: body});

      //console.log(JSON.stringify(dataJSON))

      if (dataJSON['status'] === true) {
        result['responseText'] = '';
        result['modalVisible'] = false;
        this.setState(result);
        this._loadAsync();
      }
      else{
        result['errors'] = dataJSON['errors'];
        this.setState(result);
      };
    } else {
        result['errors'] = 'Неизвестная ошибка';
        this.setState(result);
    };
  };

  _openeAnswerWindow = (props) => {
    this.setState({modalVisible: true, currentOffer: props});
  };

  _keyExtractor = (item, index) => item.id;

  _loadAsync = async () => {

    this.setState({refreshing: true});
    let dataJSON  = await GetQueryResult({method: 'GET', url: JOB_LIST_URL});

    console.log(JSON.stringify(dataJSON));

    if (dataJSON['status'] === true) {
      this.setState({data:  dataJSON['dataset'], refreshing: false, errors: ''});
    }else{
      this.setState({errors: dataJSON['errors'], refreshing: false});
    };

  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        data = {item}
        title={item.description}
        onPressItem={this._openeAnswerWindow}
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

  _willFocus = ({item}) => {
    this._loadAsync();
  };

  _goAuthLoginStack = ({item}) => {
    this.props.navigation.navigate('AuthLoginStack', );
  };

  render() {

    if (this.state.errors.length != 0) {
      return (<ErrorPage mistake={this.state.errors} willFocus={this._willFocus} goAuthLoginStack={this._goAuthLoginStack}/>);
    }

    const { navigation } = this.props;

    if (this.state.modalVisible) {

      let sendButton = null;

      if (this.state.sendingAnswer) {
        sendButton = <Button
          loading
          buttonStyle={styles.redbutton}
          title='Сохранить'/>
      } else {
        sendButton = <Button
          icon={<Icon name='done' color='#ffffff'/>}
          buttonStyle={styles.redbutton}
          title='Сохранить'
          onPress ={(props) => this._respondToTheOffer()}/>
      };

      return (
            <View style={[styles.container, {backgroundColor: "rgba(192,192,192, .5)"}]}>
              <Overlay
                height='auto'
                style={{marginTop: Dimensions.get('window').height/2-200}}
                isVisible={this.state.modalVisible}
                windowBackgroundColor="rgba(192,192,192, .5)"
                onBackdropPress={(text) => this.setState({modalVisible: !this.state.modalVisible})}
              >
                <Text style={{marginBottom: 8}}>Сопроводительное письмо</Text>
                <TextInput
                      style = {styles.textInputMultiline}
                      multiline = {true}
                      numberOfLines = {4}
                      value={this.state.responseText}
                      onChangeText={(text) => this.setState({responseText: text})}
                />
                <View style={{marginRight: -8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                  <Button
                    backgroundColor='#03A9F4'
                    buttonStyle={styles.greybutton}
                    title='Отмена'
                    onPress ={(props) => this.setState({modalVisible: !this.state.modalVisible})} />
                  {sendButton}
                </View>
              </Overlay>
            </View>
      );
    } else {
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
    };
    /*<TouchableOpacity style={styles.redSection} onPress={this._saveServicesAsync}>
      <Text style={{color: 'white'}}>ПРОДОЛЖИТЬ</Text>
    </TouchableOpacity>*/

    /**/
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

  _respondToTheOffer = (props) => {
      this.props.onPressItem(this.props);
  };

  render() {

    let data = this.props.data;
    let button = null;
    let article = null;
    let jobComposition = null;

    //console.log(data);

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
            <Text>{item.count}</Text><Text style={{color: Colors.grey}}> чел. /</Text>
            <Text>{item.price}</Text><Text style={{color: Colors.grey}}> руб.</Text>
          </View>
        )
      });
    };

    if (data.response_is_available == 1){
        button = <TouchableOpacity style={styles.redbutton} onPress = {this._respondToTheOffer}><Text style={{color: 'white'}}>Откликнуться</Text></TouchableOpacity>
    }
    else if (data.response_is_available == 0) {
        article = <View style={{flex:1, alignItems: 'flex-end'}}>
                    <Badge value = 'отклик доставлен' containerStyle={{ backgroundColor: Colors.green}}/>
                </View>
    }

    return (
      <View style={{borderWidth:0.5, borderColor: Colors.grey, padding: 8, margin:8}}>
        <View style = {{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
          <Avatar.Image size={35} source={{ uri: data.photo }} />
          <Text style={{fontSize:10, color: 'grey', marginLeft: 8}}>{data.company__name}</Text>
          {article}
        </View>
        <Divider />
        <View style={{flexDirection: 'row', marginTop: 8}}>
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
        <View style={{marginBottom: 8}}>
          <Text style={{width: '40%', color: 'grey'}}>Требуются</Text>
          {jobComposition}
        </View>
        {button}
        <Divider />
        <View style={{alignItems: 'flex-end', flex:1}}>
          <Text style={{fontSize:10, color: 'grey', marginTop: 6}}>{data.created.substring(0,10)}</Text>
        </View>
      </View>
    );
  }
}

const AppStack = createStackNavigator({ Home: JobsScreen, Auth: AuthLoginScreen},
                              {
                                initialRouteName: 'Home',
                                defaultNavigationOptions: {
                                      headerStyle: {
                                        backgroundColor: Colors.mainColor,
                                      },
                                      headerTintColor: '#fff',
                                      //headerTitleStyle: {
                                      //  fontWeight: 'bold',
                                      //},
                                    },
                              },);

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
  },
  {
    initialRouteName: 'AuthLoading',
    defaultNavigationOptions: {
          headerStyle: {
            backgroundColor: Colors.mainColor,
          },
          headerTintColor: '#fff',
          //headerTitleStyle: {
          //  fontWeight: 'bold',
          //},
        },
  }
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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

  textInputMultiline: {
    backgroundColor: 'white',
    height: 160,
    borderWidth: 0.5,
    borderColor: '#C4C4C4',
    padding: 8,
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

  greybutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C4C4C4',
    height: 40,
    borderColor: 'grey',
    borderWidth: 0.3,
    margin: 8,
  },


});
