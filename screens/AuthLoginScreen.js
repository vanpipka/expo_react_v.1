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
  KeyboardAvoidingView,
  SafeAreaView,
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
import Colors from '../constants/Colors';

import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

class SignInScreen extends React.Component {

  static navigationOptions = {
    title: 'Вход',
    headerStyle: {
      backgroundColor: Colors.mainColor,
    },
  }

  constructor(props) {
      super(props);

      const { navigation } = this.props;
      const data = navigation.getParam('data', '');

      this.state = {dataisloading: false, username: '', password: '', data: data, errors:{}, info:''};

  }

  componentWillMount() {
      this._bootstrapAsync();
  }

  render() {

    if (!this.state.dataisloading){
      return(<LoadingPage/>);
    }

    let usernameError = '';
    let passwordError = '';
    let allError      = '';

    if (this.state.errors['__all__'] == "Please enter a correct %(username)s and password. Note that both fields may be case-sensitive.") {
      allError = "Пожалуйста введите корректные логин и пароль";
    }else{
      allError = this.state.errors['__all__'];
    };

    if (this.state.errors['username'] == "This field is required.") {
      usernameError = "Поле номер телефона обязательно для заполнения";
    }else{
      usernameError = this.state.errors['username'];
    };

    if (this.state.errors['password'] == "This field is required.") {
      passwordError = "Поле пароль обязательно для заполнения";
    }else{
      passwordError = this.state.errors['password'];
    };

    return (
      <KeyboardAvoidingView style={{flex: 1}} behavior="padding"  keyboardVerticalOffset={80} enabled>
        <View style={styles.container}>
          <ImageBackground source={require('../images/bg.png')} style={{width: '100%', height: '100%', alignItems: 'center',}}>
            <View style = {{backgroundColor:'grey', width:'90%', marginTop:'50%', padding:8}}>
              {this.state.errors['username'] != undefined ?
                  <Text style={styles.errorText}>{usernameError}</Text> : null
              }
              <TextInput
                style={styles.textInput}
                onChangeText={(username) => this.setState({username: username.replace(/[^0-9]/g, '')})}
                value={this.state.username}
                placeholder = 'Номер телефона'
              />
              {this.state.errors['password'] != undefined ?
                  <Text style={styles.errorText}>{passwordError}</Text> : null
              }
              <TextInput
                style={styles.textInput}
                onChangeText={(password) => this.setState({password})}
                secureTextEntry={true}
                value={this.state.password}
                placeholder = 'Пароль'
              />
              {this.state.errors['__all__'] != undefined ?
                  <Text style={styles.errorText}>{allError}</Text> : null
              }
              <TouchableOpacity //
                onPress={this._loginAsync}
                style={styles.redbutton}>
                <Text style={{color: 'white', marginTop: 10}}>ВОЙТИ</Text>
              </TouchableOpacity>
              <View style = {{ flexDirection: 'row'}}>
                <TouchableOpacity // onPress={this._onPressButton}>
                  style = {{width: '50%', alignItems: 'flex-start', marginTop: 8,}}
                  onPress={this._signReminderAsync}>
                  <Text style={{color: '#D21C43', marginRight: 8,}}>Забыли пароль?</Text>
                </TouchableOpacity>
                <TouchableOpacity // onPress={this._onPressButton}>
                  style = {{width: '50%', alignItems: 'flex-end', marginTop: 8,}}
                  onPress={this._signUpAsync}>
                  <Text style={{color: 'white', marginRight: 8,}}>Зарегистрироваться</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
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

    const LOGIN_URL = Urls.SERVER_URL+Urls.CHECK_LOGIN_URL;

    body = encodeURIComponent('username') + '=' + encodeURIComponent(this.state.username) +
        '&'+encodeURIComponent('password') + '=' + encodeURIComponent(this.state.password) +
        '&'+encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken');

    let dataJSON  = await GetQueryResult({method: 'POST', url: LOGIN_URL, body: body});
    let sessionid = await AsyncStorage.getItem('sessionid');

    if (dataJSON['status']) {
        this.props.navigation.navigate('Home');
        return;
    }else{
        this.setState({dataisloading: true});
    };

  };

  _signUpAsync = async () => {
    this.props.navigation.navigate('SignUp');
  };

  _signReminderAsync = async () => {
    this.props.navigation.navigate('SignReminder');
  };

}

class SignUpScreen extends React.Component {

  static navigationOptions = {
    title: 'Регистрация',
    headerStyle: {
      backgroundColor: Colors.mainColor,
    },
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

    console.log("username: "+this.state.errors['username']);
    console.log("password1: "+this.state.errors['password1']);
    console.log("password2: "+this.state.errors['password2']);
    console.log("__all__: "+this.state.errors['__all__']);
    let usernameError   = '';
    let password1Error  = '';
    let password2Error  = '';
    let allError        = '';

    if (this.state.errors['__all__'] == "Please enter a correct %(username)s and password. Note that both fields may be case-sensitive.") {
      allError = "Пожалуйста введите корректные логин и пароль";
    }else{
      allError = this.state.errors['__all__'];
    };

    if (this.state.errors['username'] == "This field is required.") {
      usernameError = "Поле номер телефона обязательно для заполнения";
    }else if(this.state.errors['username'] == "A user with that username already exists.") {
      usernameError = "Пользователь с таким номером уже зарегистрирован";
    }else{
      usernameError = this.state.errors['username'];
    };

    if (this.state.errors['password1'] == "This field is required.") {
      password1Error = "Поле пароль обязательно для заполнения";
    }else{
      password1Error = this.state.errors['password1'];
    };

    if (this.state.errors['password2'] == "This field is required.") {
      password2Error = "Поле подтверждение пароля обязательно для заполнения";
    }else if(this.state.errors['password2'] == "The two password fields didn't match.") {
      password2Error = "Пароль и подтверждение пароля не совпадают";
    }else if(this.state.errors['password2'] == "This password is too short. It must contain at least %(min_length)d characters.") {
      password2Error = "Пароль слишком короткий";
    }else{
      password2Error = this.state.errors['password2'];
    };

    let form = null;
    let userNameEditable = true;

    if (this.state.errors['confirmphone'] != null) {
        userNameEditable = false;
        form =
          <View>
            {this.state.errors['confirmphone'] &&
              <Text style={styles.errorText}>{this.state.errors['confirmphone']}</Text>
            }
            <TextInput
              style={styles.textInput}
              onChangeText={(confirmphone) => this.setState({confirmphone})}
              secureTextEntry={true}
              value={this.state.confirmphone}
              placeholder = 'Код подтверждения'
            />
          </View>
      }
    else {
      form =
        <View>
          {this.state.errors['password1'] &&
            <Text style={styles.errorText}>{password1Error}</Text>
          }
          <TextInput
            style={styles.textInput}
            onChangeText={(password1) => this.setState({password1})}
            secureTextEntry={true}
            editable = {userNameEditable}
            value={this.state.password1}
            placeholder = 'Пароль'
          />
          {this.state.errors['password2'] &&
            <Text style={styles.errorText}>{password2Error}</Text>
          }
          <TextInput
            style={styles.textInput}
            onChangeText={(password2) => this.setState({password2})}
            secureTextEntry={true}
            value={this.state.password2}
            placeholder = 'Подтверждение пароля'
          />
          {this.state.errors['__all__'] &&
            <Text style={styles.errorText}>{allError}</Text>
          }
        </View>

    }

    return (
      <KeyboardAvoidingView style={{flex: 1}} behavior="padding"  keyboardVerticalOffset={80} enabled>
        <View style={styles.container}>
          <ImageBackground source={require('../images/bg.png')} style={{width: '100%', height: '100%', alignItems: 'center',}}>
            <View style = {{backgroundColor:'grey', width:'90%', marginTop: '45%', padding:8, paddingTop: 10,}}>
              {this.state.errors['username'] &&
                <Text style={styles.errorText}>{usernameError}</Text>
              }
              <TextInput
                style={styles.textInput}
                onChangeText={(username) => this.setState({username: username.replace(/[^0-9]/g, '')})}
                value={this.state.username}
                placeholder = 'Номер телефона'
              />
              {form}
              {this.state.errors['privacyPolicy'] &&
                <Text style={styles.errorText}>{this.state.errors['privacyPolicy']}</Text>
              }
              <View style = {{ flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  checked={this.state.privacyPolicy}
                  checkedColor = {'#D21C43'}
                  onPress={() => this.setState({privacyPolicy: !this.state.privacyPolicy})}
                />
                <View style={{flexWrap: 'wrap'}}>
                  <Text style={{fontSize: 10,}}>Я в полном объеме ознакомлен и согласен с </Text>
                  <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
                    Условиями использования
                  </Text>
                </View>
              </View>
              <TouchableOpacity //
                onPress={this._loginAsync}
                style={styles.redbutton}>
                <Text style={{color: 'white', marginTop: 10}}>ЗАРЕГИСТРИРОВАТЬСЯ</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
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

      const SIGNUP_URL = Urls.SERVER_URL+Urls.REGISTER_URL;

      body = encodeURIComponent('username') + '=' + encodeURIComponent(this.state.username) +
        '&'+encodeURIComponent('password1') + '=' + encodeURIComponent(this.state.password1) +
        '&'+encodeURIComponent('password2') + '=' + encodeURIComponent(this.state.password2) +
        '&'+encodeURIComponent('confirmphone') + '=' + encodeURIComponent(this.state.confirmphone) +
        '&'+encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken');

      let dataJSON  = await GetQueryResult({method: 'POST', url: SIGNUP_URL, body: body});

      let sessionid = await AsyncStorage.getItem('sessionid');

      if (dataJSON['errors'] != undefined) { errors = dataJSON['errors'];}

      if (sessionid != null) {
        this.props.navigation.navigate('Home');
      }
      else{

        //console.log(JSON.stringify(dataJSON));
        this.setState({data: JSON.stringify(dataJSON), errors: errors});
      };

  };

}

class SignReminderScreen extends React.Component {

  static navigationOptions = {
    title: 'Восстановление пароля',
    headerStyle: {
      backgroundColor: Colors.mainColor,
    },
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

    console.log("username: "+this.state.errors['username']);
    console.log("password1: "+this.state.errors['password1']);
    console.log("password2: "+this.state.errors['password2']);
    console.log("__all__: "+this.state.errors['__all__']);
    let usernameError   = '';
    let password1Error  = '';
    let password2Error  = '';
    let allError        = '';

    if (this.state.errors['__all__'] == "Please enter a correct %(username)s and password. Note that both fields may be case-sensitive.") {
      allError = "Пожалуйста введите корректные логин и пароль";
    }else{
      allError = this.state.errors['__all__'];
    };

    if (this.state.errors['username'] == "This field is required.") {
      usernameError = "Поле номер телефона обязательно для заполнения";
    }else if(this.state.errors['username'] == "A user with that username already exists.") {
      usernameError = "Пользователь с таким номером уже зарегистрирован";
    }else{
      usernameError = this.state.errors['username'];
    };

    if (this.state.errors['password1'] == "This field is required.") {
      password1Error = "Поле пароль обязательно для заполнения";
    }else{
      password1Error = this.state.errors['password1'];
    };

    if (this.state.errors['password2'] == "This field is required.") {
      password2Error = "Поле подтверждение пароля обязательно для заполнения";
    }else if(this.state.errors['password2'] == "The two password fields didn't match.") {
      password2Error = "Пароль и подтверждение пароля не совпадают";
    }else if(this.state.errors['password2'] == "This password is too short. It must contain at least %(min_length)d characters.") {
      password2Error = "Пароль слишком короткий";
    }else{
      password2Error = this.state.errors['password2'];
    };

    let form = null;
    let userNameEditable = true;

    if (this.state.errors['confirmphone'] != null) {
        userNameEditable = false;
        form =
          <View>
            {this.state.errors['confirmphone'] &&
              <Text style={styles.errorText}>{this.state.errors['confirmphone']}</Text>
            }
            <TextInput
              style={styles.textInput}
              onChangeText={(confirmphone) => this.setState({confirmphone})}
              secureTextEntry={true}
              value={this.state.confirmphone}
              placeholder = 'Код подтверждения'
            />
          </View>
      }
    else {
      form =
        <View>
          {this.state.errors['password1'] &&
            <Text style={styles.errorText}>{password1Error}</Text>
          }
          <TextInput
            style={styles.textInput}
            onChangeText={(password1) => this.setState({password1})}
            secureTextEntry={true}
            editable = {userNameEditable}
            value={this.state.password1}
            placeholder = 'Новый пароль'
          />
          {this.state.errors['password2'] &&
            <Text style={styles.errorText}>{password2Error}</Text>
          }
          <TextInput
            style={styles.textInput}
            onChangeText={(password2) => this.setState({password2})}
            secureTextEntry={true}
            value={this.state.password2}
            placeholder = 'Подтверждение пароля'
          />
          {this.state.errors['__all__'] &&
            <Text style={styles.errorText}>{allError}</Text>
          }
        </View>

    }

    return (
      <KeyboardAvoidingView style={{flex: 1}} behavior="padding"  keyboardVerticalOffset={80} enabled>
        <View style={styles.container}>
          <ImageBackground source={require('../images/bg.png')} style={{width: '100%', height: '100%', alignItems: 'center',}}>
            <View style = {{backgroundColor:'grey', width:'90%', marginTop: '45%', padding:8, paddingTop: 10,}}>
              {this.state.errors['username'] &&
                <Text style={styles.errorText}>{usernameError}</Text>
              }
              <TextInput
                style={styles.textInput}
                onChangeText={(username) => this.setState({username: username.replace(/[^0-9]/g, '')})}
                value={this.state.username}
                placeholder = 'Номер телефона'
              />
              {form}
              <TouchableOpacity //
                onPress={this._resetAsync}
                style={styles.redbutton}>
                <Text style={{color: 'white', marginTop: 10}}>ВОССТАНОВИТЬ ПАРОЛЬ</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </KeyboardAvoidingView>
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

  _resetAsync = async () => {

      const SIGNUP_URL = Urls.SERVER_URL+Urls.RESET_PASS_URL;

      body = encodeURIComponent('username') + '=' + encodeURIComponent(this.state.username) +
        '&'+encodeURIComponent('password1') + '=' + encodeURIComponent(this.state.password1) +
        '&'+encodeURIComponent('password2') + '=' + encodeURIComponent(this.state.password2) +
        '&'+encodeURIComponent('confirmphone') + '=' + encodeURIComponent(this.state.confirmphone) +
        '&'+encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken');


      let dataJSON  = await GetQueryResult({method: 'POST', url: SIGNUP_URL, body: body});
        console.log(JSON.stringify(dataJSON));
      let sessionid = await AsyncStorage.getItem('sessionid');

      if (dataJSON['errors'] != undefined) { errors = dataJSON['errors'];}

      if (sessionid != null) {
        this.props.navigation.navigate('Home');
      }
      else{

        //console.log(JSON.stringify(dataJSON));
        this.setState({data: JSON.stringify(dataJSON), errors: errors});
      };

  };

}

const AppStack = createStackNavigator({ Home: SettingsScreen,
                                        SelectCityPage: CitysScreen,
                                        SelectProfessionPage:  ProfessionsScreen,
                                        SelectCountryPage: CountrysScreen,
                                        EditServicesPage: EditServicesScreen,
                                        EditProfessionsPage: EditProfessionsScreen},
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

const AuthStack = createStackNavigator({ SignIn: SignInScreen, SignUp: SignUpScreen, SignReminder: SignReminderScreen,});

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
