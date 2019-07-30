import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { WebBrowser } from 'expo';
import { CheckBox } from 'react-native-elements';
import { GetQueryResult } from '../components/WebAPI';
import ProfessionsScreen from '../screens/ProfessionsScreen';
import EditProfessionsScreen from '../screens/EditProfessionsScreen';
import EditServicesScreen from '../screens/EditServicesScreen';
import CitysScreen from '../screens/CitysScreen';
import CountrysScreen from '../screens/CountrysScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoadingPage from '../screens/LoadingPage';
import Background from '../images/bg.png';
import Urls from '../constants/Urls';

import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

class SignInScreen extends React.Component {

  static navigationOptions = {
    title: 'Вход',
  }

  constructor(props) {
      super(props);

      const { navigation } = this.props;
      const data = navigation.getParam('data', '');

      this.state = {dataisloading: false, username: '', password: '', data: data, errors:{}, info:''};

      this._bootstrapAsync();
  }

  render() {

    if (!this.state.dataisloading){
      return(<LoadingPage/>);
    }

    return (

      <View style={styles.container}>
        <ImageBackground source={require('../images/bg.png')} style={{width: '100%', height: '100%', alignItems: 'center',}}>
          <View style = {{backgroundColor:'grey', width:'90%', marginTop:'50%', padding:8}}>
            {this.state.errors['username'] != undefined ?
                <Text style={styles.errorText}>{this.state.errors['username']}</Text> : null
            }
            <TextInput
              style={styles.textInput}
              onChangeText={(username) => this.setState({username: username.replace(/[^0-9]/g, '')})}
              value={this.state.username}
              placeholder = 'Номер телефона'
            />
            {this.state.errors['password'] != undefined ?
                <Text style={styles.errorText}>{this.state.errors['password']}</Text> : null
            }
            <TextInput
              style={styles.textInput}
              onChangeText={(password) => this.setState({password})}
              secureTextEntry={true}
              value={this.state.password}
              placeholder = 'Пароль'
            />
            {this.state.errors['__all__'] != undefined ?
                <Text style={styles.errorText}>{this.state.errors['__all__']}</Text> : null
            }
            <TouchableOpacity //
              onPress={this._loginAsync}
              style={styles.redbutton}>
              <Text style={{color: 'white', marginTop: 10}}>ВОЙТИ</Text>
            </TouchableOpacity>
            <TouchableOpacity // onPress={this._onPressButton}>
              style = {{width: '100%', alignItems: 'flex-end', marginTop: 8,}}
              onPress={this._signUpAsync}>
              <Text style={{color: 'white', marginRight: 8,}}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    )
  }

  _loginAsync = async () => {

    const LOGIN_URL = Urls.SERVER_URL+Urls.LOGIN_URL;

    body = encodeURIComponent('username') + '=' + encodeURIComponent(this.state.username) +
        '&'+encodeURIComponent('password') + '=' + encodeURIComponent(this.state.password) +
        '&'+encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken');

    let dataJSON  = await GetQueryResult({method: 'POST', url: LOGIN_URL, body: body});
    let sessionid = await AsyncStorage.getItem('sessionid');

    let errors = {};
    let cookies = {};

    if (dataJSON['errors'] != undefined) { errors = dataJSON['errors'];}

    if (sessionid != null) {
        this.props.navigation.navigate('Home');
    }else{
        this.setState({data: JSON.stringify(dataJSON), errors: errors, info: JSON.stringify(dataJSON)});
    };

  };

  _bootstrapAsync = async () => {

    const LOGIN_URL = Urls.SERVER_URL+Urls.LOGIN_URL;

    body = encodeURIComponent('username') + '=' + encodeURIComponent(this.state.username) +
        '&'+encodeURIComponent('password') + '=' + encodeURIComponent(this.state.password) +
        '&'+encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken');

    let dataJSON  = await GetQueryResult({method: 'POST', url: LOGIN_URL, body: body});
    let sessionid = await AsyncStorage.getItem('sessionid');

    if (sessionid != null) {
        this.props.navigation.navigate('Home');
        return;
    }else{
        this.setState({dataisloading: true});
    };

  };

  _signUpAsync = async () => {
    this.props.navigation.navigate('SignUp');
  };
}

class SignUpScreen extends React.Component {

  static navigationOptions = {
    title: 'Регистрация',
  };

  constructor(props) {
      super(props);

      const { navigation } = this.props;
      const data = navigation.getParam('data', '');

      this.state = {dataisloading: false,
                    username: '',
                    password1: '',
                    password2: '',
                    confirmphone: '',
                    renderconfirmphone: false,
                    data: data,
                    errors:{},
                    privacyPolicy: false};

      this._bootstrapAsync();
  }

  render() {

    if (!this.state.dataisloading){
      return(<LoadingPage/>);
    }

    let form = null;
    let userNameEditable = true;

    if (this.state.errors['confirmphone'] != null) {

        userNameEditable = false;

        let errorValue = this.state.errors['confirmphone'] == true ? null : <Text style={styles.errorText}>{this.state.errors['confirmphone']}</Text>

        form =
          <View>
            <TextInput
              style={styles.textInput}
              onChangeText={(confirmphone) => this.setState({confirmphone})}
              secureTextEntry={true}
              value={this.state.confirmphone}
              placeholder = 'Код подтверждения'
            />
            {errorValue}
          </View>
      }
    else {
      form =
        <View>
          <Text></Text>
          <TextInput
            style={styles.textInput}
            onChangeText={(password1) => this.setState({password1})}
            secureTextEntry={true}
            editable = {userNameEditable}
            value={this.state.password1}
            placeholder = 'Пароль'
          />
          <Text style={styles.errorText}>{this.state.errors['password1']}</Text>
          <Text></Text>
          <TextInput
            style={styles.textInput}
            onChangeText={(password2) => this.setState({password2})}
            secureTextEntry={true}
            value={this.state.password2}
            placeholder = 'Подтверждение пароля'
          />
          <Text style={styles.errorText}>{this.state.errors['password2']}</Text><Text style={styles.errorText}>{this.state.errors['__all__']}</Text>
        </View>

    }

    return (
      <View style={styles.container}>
        <ImageBackground source={require('../images/bg.png')} style={{width: '100%', height: '100%', alignItems: 'center',}}>
          <View style = {{backgroundColor:'grey', width:'90%', marginTop: '45%', padding:8, paddingTop: 10,}}>
            <TextInput
              style={styles.textInput}
              onChangeText={(username) => this.setState({username: username.replace(/[^0-9]/g, '')})}
              value={this.state.username}
              placeholder = 'Номер телефона'
            />
            <Text style={styles.errorText}>{this.state.errors['username']}</Text>
            {form}
            <View style = {{ flexDirection: 'row'}}>
              <CheckBox
                checked={this.state.privacyPolicy}
                checkedColor = {'#D21C43'}
                onPress={() => this.setState({privacyPolicy: !this.state.privacyPolicy})}
              />
              <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
                <Text style={{fontSize: 10,}}>Я ознакомлен и согласен с </Text>
                <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
                  Условиями использования
                </Text>
                <Text style={{fontSize: 10,}}> в полном объеме</Text>
              </View>
            </View>
            <Text style={styles.errorText}>{this.state.errors['privacyPolicy']}</Text>
            <TouchableOpacity //
              onPress={this._loginAsync}
              style={styles.redbutton}>
              <Text style={{color: 'white', marginTop: 10}}>ЗАРЕГИСТРИРОВАТЬСЯ</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync(Urls.SERVER_URL+Urls.PRIVACY_POLICY_URL);
  };

  _bootstrapAsync = async () => {

      let headers = {};
      headers['X-Requested-With'] = 'XMLHttpRequest';
      headers['Cookie'] = 'csrftoken='+await AsyncStorage.getItem('csrftoken')+'; '+'sessionid='+await AsyncStorage.getItem('sessionid');

      try {
        let url = Urls.SERVER_URL+Urls.LOGIN_URL;
        let response = await fetch(url, {headers:headers});
        let data = await response.text();
        if (Platform.OS === 'android') {
          data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
        }

        let dataJSON = JSON.parse(data);
        let cookies  = dataJSON['cookies'];

        if (dataJSON['csrfmiddlewaretoken'] != null) {await AsyncStorage.setItem('csrfmiddlewaretoken', dataJSON['csrfmiddlewaretoken'])};
        if (cookies['csrftoken'] != null) {await AsyncStorage.setItem('csrftoken', cookies['csrftoken'])};
        if (cookies['sessionid'] != null) {
          await AsyncStorage.setItem('sessionid', cookies['sessionid']);
          //
          this.props.navigation.navigate('Home');
          return;
        };
      } catch (error) {
      };
      this.setState({dataisloading: true})
  };

  _loginAsync = async () => {

      if (!this.state.privacyPolicy) {
        this.setState({errors: {privacyPolicy: 'Необходимо подтвердить условия использования'}});
        return;
      }

      let headers = {};

      headers["X-Requested-With"] = "XMLHttpRequest";
      headers["Cookie"] = "csrftoken="+await AsyncStorage.getItem('csrftoken');
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

      body = encodeURIComponent('username') + '=' + encodeURIComponent(this.state.username) +
        '&'+encodeURIComponent('password1') + '=' + encodeURIComponent(this.state.password1) +
        '&'+encodeURIComponent('password2') + '=' + encodeURIComponent(this.state.password2) +
        '&'+encodeURIComponent('confirmphone') + '=' + encodeURIComponent(this.state.confirmphone) +
        '&'+encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken');

    try {
      let url = Urls.SERVER_URL+Urls.REGISTER_URL;

      Alert.alert('url', 'стучим в логин');

      let response = await fetch(url, {method: 'POST', body: body, headers: headers});
      let data = await response.text();
      if (Platform.OS === 'android') {
        data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
      }

      Alert.alert('data', 'Получили данные');

      let dataJSON = JSON.parse(data);
      let errors = {};
      let cookies = {};

      if (dataJSON['errors'] != undefined) { errors = dataJSON['errors'];}
      if (dataJSON['cookies'] != undefined) { cookies = dataJSON['cookies'];}

      if (dataJSON['csrfmiddlewaretoken'] != null) {await AsyncStorage.setItem('csrfmiddlewaretoken', dataJSON['csrfmiddlewaretoken'])};
      if (cookies['csrftoken'] != null) {await AsyncStorage.setItem('csrftoken', cookies['csrftoken'])};
      if (cookies['sessionid'] != null) {
        await AsyncStorage.setItem('sessionid', cookies['sessionid'])
        this.props.navigation.navigate('Home');
      }
      else{
        this.setState({data: data, errors: errors});
      };

      /*let dataJSON = JSON.parse(data);
      let cookies  = dataJSON['cookies'];

      if (dataJSON['csrfmiddlewaretoken'] != null) {await AsyncStorage.setItem('csrfmiddlewaretoken', dataJSON['csrfmiddlewaretoken'])};
      if (cookies['csrftoken'] != null) {await AsyncStorage.setItem('csrftoken', cookies['csrftoken'])};
      if (cookies['sessionid'] != null) {
        await AsyncStorage.setItem('sessionid', cookies['sessionid'])
        this.props.navigation.navigate('Home');
      };*/


    } catch (error) {
        return;
    };

  };

}

const AppStack = createStackNavigator({ Home: SettingsScreen,
                                        SelectCityPage: CitysScreen,
                                        SelectProfessionPage:  ProfessionsScreen,
                                        SelectCountryPage: CountrysScreen,
                                        EditServicesPage: EditServicesScreen,
                                        EditProfessionsPage: EditProfessionsScreen});

const AuthStack = createStackNavigator({ SignIn: SignInScreen, SignUp: SignUpScreen,});

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: SignInScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textInput: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 8,
  },

  redbutton: {
    alignItems: 'center',
    backgroundColor: '#D21C43',
    height: 40,
    borderColor: 'black',
    borderWidth: 0.3,
  },

  errorText: {
    marginLeft: 8,
    marginRight: 8,
    color: 'red',
  },

  helpLinkText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D21C43',
  },

});
