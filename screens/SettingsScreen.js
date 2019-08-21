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
  Image,
  ScrollView,
  DatePickerAndroid,
  Picker,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';

import {GetQueryResult} from '../components/WebAPI';
import StarRating from '../components/Rating';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import Urls from '../constants/Urls';
import * as ImagePicker from 'expo-image-picker';
import { CheckBox, ButtonGroup } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';

class LogoTitle extends React.Component {
  render() {
    return (
      <View style={{flex:1, height: '100%', justifyContent: 'center', flexDirection: 'row'}}>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Профиль</Text>
        <TouchableOpacity style={{backgroundColor: 'grey'}} onPress={this._exitAsync}>
          <Text>Выйти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _exitAsync = async () => {
    //Alert.alert('!!!')
    await AsyncStorage.removeItem('sessionid');
    this.props.navigation.navigate('SignIn');
  };

}

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Профиль',
  };

  constructor(props) {
      super(props);

      const { navigation } = this.props;
      const data = navigation.getParam('data', '');

      this.state = {dataisloading: false, data: data, image: null, imagebase64: null, refreshing: false, error: false};
      this.SetListState = this.SetListState.bind(this);

  }

  componentDidMount() {
    this.getPermissionAsync();
    this._bootstrapAsync();
  }

  getPermissionAsync = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality : 1,
      aspect: [4, 4],
      base64: true,
    });

    //console.log(result)

    if (!result.cancelled) {

      this.setState({dataisloading: false,});

      const SAVESETTINGS_URL = Urls.SERVER_URL+Urls.SAVESETTINGS_URL;
      let bodyData = {fotourl: result.base64};

      let body = encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken')
                  +"&"+ encodeURIComponent('data') + '=' + encodeURIComponent(JSON.stringify(bodyData));

      let dataJSON  = await GetQueryResult({method: 'POST', url: SAVESETTINGS_URL, body: body});

      this.setState({dataisloading: true, image: result.uri});
    }
  };

  render() {

    let { dataisloading, error } = this.state;

    if (error){
      return(<ErrorPage/>);
    };

    if (!dataisloading){
      return(<LoadingPage/>);
    };
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */

    let settingsView = this.GetSettingsView();

    if (Platform.OS === 'android') {
       return(
         <KeyboardAvoidingView style={{flex: 1}} behavior="padding"  keyboardVerticalOffset={80} enabled>
           <View style={styles.container}>
              <ScrollView>
                <TouchableOpacity onPress={this._exitAsync} style={styles.greySection}>
                  <Text style={{color: 'grey', marginRight: 8, marginTop: -4}}>Выйти</Text>
                </TouchableOpacity>
                <View style={{padding: 8}}>
                  {settingsView}
                </View>
              </ScrollView>
              <TouchableOpacity onPress={this._saveAsync} style={styles.redSection}>
                <Text style={{color: 'white', marginRight: 8, marginTop: -4}}>СОХРАНИТЬ</Text>
              </TouchableOpacity>
           </View>
        </KeyboardAvoidingView>
        );
      } else {
        return(
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
               <ScrollView
                 refreshControl={
                   <RefreshControl
                     refreshing={this.state.refreshing}
                     onRefresh={this._bootstrapAsync}
                   />
                 }
                >
                 <TouchableOpacity onPress={this._exitAsync} style={styles.greySection}>
                   <Text style={{color: 'grey', marginRight: 8, marginTop: -4}}>Выйти</Text>
                 </TouchableOpacity>
                 <View style={{padding: 8}}>
                   {settingsView}
                 </View>
               </ScrollView>
               <TouchableOpacity onPress={this._saveAsync} style={styles.redSection}>
                 <Text style={{color: 'white', marginRight: 8, marginTop: -4}}>СОХРАНИТЬ</Text>
               </TouchableOpacity>
            </View>
         </SafeAreaView>
       );
      };
  }

  GetSettingsView(){

    let dataJSON = JSON.parse(this.state.data);

    const groupArray = dataJSON.worker.group.map((item, index) => {
      const properties = this.renderItems(item.items);
      return (
        <View key={index} style={{marginTop:8, paddingRight:8,}}>
          <View>
            <Text style={{color:'#D21C43', fontWeight: 'bold', marginBottom: 8}}>{item.name}</Text>
          </View>
          {properties}
        </View>
      )
    });

    return (<View>{groupArray}</View>)
  }

  GetRating(rat, comments){

    let rating          = parseFloat(rat).toFixed(1);
    let commentscount   = comments == '0' ? 'нет отзывов' : comments + ' отзывов';

    return (
      <View style={{marginLeft: 8, height: 40, flexDirection: 'row'}}>
          <View style={{height:'100%', justifyContent: 'center', backgroundColor: 'rgba(229, 229, 229, 1)', padding: 8}}>
            <Text style={{color: 'grey', fontSize: 20, fontWeight: 'bold',}}>{rating}</Text>
          </View>
          <View style={{height:'100%', justifyContent: 'center', marginLeft:8, marginRight:8,}}>
            <StarRating ratingObj={{ratings: rating,  views: 34000 }} />
            <Text style={{}}>{commentscount}</Text>
          </View>
      </View>
    )

  }

  renderItems(items){

    const properties = items.map((item, index) => {

      if (item.type === 'base64') {

          let ratingView = null;

          if (item['additionaly'] != undefined) {
              ratingView = this.GetRating(item['additionaly']['rating'].value, item['additionaly']['commentscount'].value);

          };

          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <View style={{width: '50%', height: 150}}>
                {this.state.image &&
                  <Image resizeMode='contain' source={{ uri: this.state.image }} style={{ width: 150, height: 150, marginRight:-8 }} />}
                {!this.state.image &&
                  <ImageBackground resizeMode='contain' source = {this.GetFotoURL(item.value)} style={{width: 150, height: 150, marginRight:-8}}/>}
              </View>
              <View style={{width: '50%', height: 150}}>
                <TouchableOpacity>
                  {ratingView}
                </TouchableOpacity>
                <TouchableOpacity style={styles.whitebutton} onPress = {this._pickImage}>
                  <Text style={{color:'#D21C43', fontWeight: 'bold'}}>Сменить фото</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
      }
      else if (item.type === 'string') {
          return (
            <View key = {index} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.greylabel}>{item.label}</Text>
              <TextInput
                  style = {styles.textInput}
                  value={this.state[item.columnname]}
                  onChangeText={(text) => this.SetValue(text, item.columnname)}
              />
            </View>
          )
      }
      else if (item.type === 'int') {
          return (
            <View key = {index} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.greylabel}>{item.label}</Text>
              <TextInput
                  style = {styles.textInput}
                  value={this.state[item.columnname]}
                  onChangeText={(text) => this.SetValue(text, item.columnname)}
              />
            </View>
          )
      }
      else if (item.type === 'table') {

          let table = this.GetPriceList(this.state[item.columnname]);

          return (
            <View key = {index}>
              <View key = {index} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.greylabel}>{item.label}</Text>
                <TouchableOpacity style={{padding: 8, marginTop: 6}}
                  onPress={() => this.props.navigation.navigate("EditServicesPage", {services: this.state[item.columnname], onGoBack: this._reloadData})}>
                  <Text style={{color: '#D21C43'}}>Редактировать</Text>
                </TouchableOpacity>
              </View>
              {table}
            </View>
          )
      }
      else if (item.type === 'date') {
          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <Text style={[styles.greylabel,{marginTop: 12}]}>{item.label}</Text>

              <View style={styles.textInput}>
                <DatePicker
                    style={{}}
                    date={this.state[item.columnname]}
                    mode="date"
                    placeholder="select date"
                    format="YYYY-MM-DD"
                    minDate="1950-01-01"
                    maxDate="2025-12-31"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    showIcon = {false}
                    customStyles={{
                      dateInput: {borderWidth:0, alignItems: 'flex-start'}
                    }}
                    onDateChange={(date) => {this.SetValue(date, item.columnname)}}
                  />
                </View>
            </View>
          )
      }
      else if (item.type === 'year') {

          let itemList = this.GetSelectList(item['min'], item['max']);

          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <Text style={[styles.greylabel,{marginTop: 12}]}>{item.label}</Text>

              <View style={[styles.textInput]}>
                <Picker
                  selectedValue={String(this.state[item.columnname])}
                  prompt = {item.label}
                  style={{ width: '100%', marginTop:-6, marginLeft:-6 }}
                  onValueChange={(itemValue, itemIndex) => this.SetValue(itemValue, item.columnname)}>
                  {itemList}
                  </Picker>
                </View>
            </View>
          )
      }
      else if (item.type === 'text') {
          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <Text style={styles.greylabel}>{item.label}</Text>
              <TextInput
                  style = {styles.textInputMultiline}
                  multiline = {true}
                  numberOfLines = {4}
                  value={this.state[item.columnname]}
                  onChangeText={(text) => this.SetValue(text, item.columnname)}
              />
            </View>
          )
      }
      else if (item.type === 'binaryswitch') {
          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <Text style={[styles.greylabel, {marginTop:15}]}>{item.label}</Text>
              <View style={{width: '60%', paddingLeft: 8}}>
                <ButtonGroup
                  buttons={item.values}
                  onPress={this.SetListState}
                  groupName = {item.columnname}
                  selectedIndex={this.state[item.columnname]}
                  selectedButtonStyle={{backgroundColor: '#D21C43'}}
                  containerStyle={{height: 40, alignItems: 'center', justifyContent: 'center',}}
                />
              </View>
            </View>
          )
      }
      else if (item.type === 'multipleref') {

        let professionsList = this.RenderProfessions(this.state[item.columnname]);

        if (this.state[item.columnname].length == 0) {
          return (
            <View key = {index}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.greylabel}>{item.label}</Text>
                <TouchableOpacity style={{padding: 8}}
                  onPress={() => this.props.navigation.navigate("EditProfessionsPage", {professions: this.state[item.columnname], onGoBack: this._reloadData})}>
                  <Text style={{color: '#D21C43'}}>Редактировать</Text>
                </TouchableOpacity>
              </View>
              <Text style={{color: '#C4C4C4', marginLeft:8}}>Нет данных о трудовых навыках. Нажмите "редактировать" для указания профессий.</Text>
            </View>
          );
        };
        return (
          <View key = {index} style={{flexDirection: 'row'}}>
            <Text style={styles.greylabel}>{item.label}</Text>
            <TouchableOpacity style={{width: '60%'}} onPress={() => this.props.navigation.navigate("EditProfessionsPage", {professions: this.state[item.columnname], onGoBack: this._reloadData})}>
              {professionsList}
            </TouchableOpacity>
          </View>
        )
      }
      else if (item.type === 'ref') {
        if (item.columnname === 'city') {
          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <Text style={styles.greylabel}>{item.label}</Text>
              <TouchableOpacity style={styles.textInput} onPress={() => this.props.navigation.navigate("SelectCityPage", {onGoBack: this._refreshCity})}>
                <Text style={{marginTop: 9}}>{this.state.city_name === '' ? '' : this.state.city_name}</Text>
              </TouchableOpacity>
            </View>
          )
        }
        else if (item.columnname === 'country') {
          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <Text style={styles.greylabel}>{item.label}</Text>
              <TouchableOpacity style={styles.textInput} onPress={() => this.props.navigation.navigate("SelectCountryPage", {country_id: this.state.country, onGoBack: this._refreshCountry})}>
                <Text style={{marginTop: 9}}>{this.state.country_name === '' ? '' : this.state.country_name}</Text>
              </TouchableOpacity>
            </View>
          )
        }
        else {
          return (
            <Text key={index} style={{color:'black', fontWeight: 'bold', marginBottom: 8}}>{item.columnname}</Text>
          )
        }
      }
      else if (item.type === 'boolean') {
        if (item['labelposition'] === 'right'){
          return(
            <View key = {index} style={{padding: 4, alignItems: 'center', flexDirection: 'row', backgroundColor: item.backgroundcolor, marginLeft:-8, marginRight: -16,}}>
              <View style={{marginLeft:-4, marginTop: 4}}>
                <CheckBox key={index}
                  title = {item.title}
                  checked={this.state[item.columnname]}
                  checkedColor = {'#D21C43'}
                  onPress={() => this.SetBooleanState(item.columnname)}
                />
              </View>
              <Text multiline={true} style={{}}>{item.label}</Text>
            </View>
          )
        }
        else{
          return (
            <View key = {index} style={{flexDirection: 'row'}}>
              <Text style={styles.greylabel}>{item.label}</Text>
              <View style={{marginLeft:-4, marginTop: 4}}>
                <CheckBox key={index}
                  title = {item.title}
                  checked={this.state[item.columnname]}
                  checkedColor = {'#D21C43'}
                  onPress={() => this.SetBooleanState(item.columnname)}
                />
              </View>
            </View>)
        }
      }
      else {
        return (
          <Text key={index} style={{color:'black', fontWeight: 'bold', marginBottom: 8}}>{item.columnname}</Text>
        )
      }
    });

    return (properties)
  }

  RenderProfessions(data) {

    if (data.length == 0) {

            //<View style={{flexWrap: 'wrap', flexDirection: 'row', flex: 1,}}>
    }
    else {
      const list = data.map((item, index) => {

        //Alert.alert(item.name);
        return (
          <Text key = {index} style={{width: '93%'}}>
            {item.name},
          </Text>
        )
      });
      return <View style={{flexWrap: 'wrap', flexDirection: 'row', flex: 1,}}>{list}</View>;
    }
  }

  GetPriceList(works){

    if (works === undefined) {
      return null;
    }

    let professions = works.map((item, index) => {
        if (item.price === 0 || item.price === '0') {
          return null
        }
        return (
          <View key={item.id} style={{flexDirection: 'row', flex: 1,flexGrow: 1}}>
            <Text style={{}}>{item.service}</Text>
            <View style={{marginLeft:4, marginRight:4, marginBottom:8, flexGrow: 1,borderBottomWidth:0.5, borderStyle: 'dotted', borderBottomColor: '#C4C4C4'}}/>
            <Text>{item.price}</Text><Text style={{color: '#C4C4C4'}}> руб.</Text>
          </View>
        )
    });

    if (professions.length == 0) {
        return(<View style={{padding: 8}}>
                <Text style={{color: '#C4C4C4'}}>Нет данных о желаемой оплате за работу на стенде. Нажмите "редактировать" для указания часовой ставки.</Text>
             </View>);
    }

    return(<View style={{padding: 8}}>
              {professions}
           </View>);
  };

  GetSelectList(min, max){

    let itemlist = [];
    let i = 0;
    let y = Number(min);
    let count = Number(max) - y;

    for (i = 0; i <= count; i++){
      itemlist.push(<Picker.Item key = {i} label={String(y+i)} value={String(y+i)} />);
    };

    return (itemlist);
  };

  SetListState(selected){
    let tt = {};
    tt[selected.groupName] = selected.value;
    this.setState(tt);
  };

  SetValue(text, columnname){

      //Alert.alert('text='+text+'/column='+columnname);
      let tt = {};
      if (columnname === 'phonenumber' || columnname === 'salary'){
        text = text.replace(/[^0-9]/g, '');
      };
      tt[columnname] = text;
      this.setState(tt);
  };

  GetFotoURL(url){
    if (url == '/static/main/img/add-photo.png'){
        return (photoSource = require('../images/nofoto.png'))
    }
    return (photoSource = {uri: url})
  };

  SetBooleanState(data){
    let tt = {};
    tt[data] = !this.state[data];
    this.setState(tt);
  };

  _refreshCity=(data)=> {
    this.setState({city: data['id'], city_name: data['name']})
  };

  _reloadData=(dataset)=> {

    //Alert.alert(String(dataset['services'][0]['id']));
    //this._bootstrapAsync();

    this.setState(dataset)
  };

  _refreshCountry=(data)=> {
    this.setState({country: data['id'], country_name: data['name']})
  };

  _refreshProfession=(data)=> {
    this.setState({profession: data})
  };

  _bootstrapAsync = async () => {

      const LOGIN_URL = Urls.SERVER_URL+Urls.SETTINGS_URL;

      body = encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken');

      let dataJSON  = await GetQueryResult({method: 'POST', url: LOGIN_URL, body: body});

      let formData = {data: JSON.stringify(dataJSON), dataisloading: true, error: false};

      //console.log(JSON.stringify(dataJSON));

      if (!dataJSON.worker.group) {
          this.setState({error: true});
      } else {

        dataJSON.worker.group.map((item, index) => {
          item.items.map((item, index) => {

                if (item.type === 'ref'){
                    formData[item.columnname] = item.value['id'];
                    formData[item.columnname+'_name'] = item.value['name'];
                }
                else {
                    formData[item.columnname] = item.value;
                }
          });
        });

        if (dataJSON['userid'] != null) {await AsyncStorage.setItem('userid', dataJSON['userid'])};

        this.setState(formData);

    };

  };

  _exitAsync = async () => {
    await AsyncStorage.removeItem('sessionid');
    this.props.navigation.navigate('SignIn');
  };

  _saveAsync = async () => {

    //this.state['fotourl'] = this.state.base64

    this.setState({dataisloading: false, data: '',});

    const SAVESETTINGS_URL = Urls.SERVER_URL+Urls.SAVESETTINGS_URL;
    let bodyData = {};

    bodyData['name']            = this.state.name ;
    bodyData['surname']         = this.state.surname ;
    bodyData['lastname']        = this.state.lastname ;
    bodyData['emailaddress']    = this.state.emailaddress ;
    bodyData['phonenumber']     = this.state.phonenumber ;
    bodyData['city']            = this.state.city ;
    bodyData['haveip']          = this.state.haveip ;
    bodyData['workpermit']      = this.state.workpermit ;
    bodyData['experiencedate']  = this.state.experiencedate ;
    bodyData['salary']          = this.state.salary ;
    bodyData['experience']      = this.state.experience ;
    bodyData['country']         = this.state.country ;
    bodyData['birthday']        = this.state.birthday ;
    bodyData['haveinstrument']  = this.state.haveinstrument ;
    bodyData['publishdata']     = this.state.publishdata ;
    bodyData['professions']     = this.state.professions ;
    bodyData['readytotravel']   = this.state.readytotravel ;
    bodyData['haveshengen']     = this.state.haveshengen ;
    bodyData['haveintpass']     = this.state.haveintpass ;
    bodyData['sex']             = this.state.sex ;
    bodyData['services']        = this.state.services ;

    let body = encodeURIComponent('csrfmiddlewaretoken') + '=' + await AsyncStorage.getItem('csrfmiddlewaretoken')
                +"&"+ encodeURIComponent('data') + '=' + encodeURIComponent(JSON.stringify(bodyData));

    let dataJSON  = await GetQueryResult({method: 'POST', url: SAVESETTINGS_URL, body: body});

    this._bootstrapAsync();

  };

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  textInputMultiline: {
    backgroundColor: 'white',
    height: 160,
    borderWidth: 0.5,
    margin: 8,
    marginBottom: 0,
    paddingLeft: 8,
    paddingRight: 8,
    width: '60%',
    borderColor: '#C4C4C4',
  },

  textInput: {
    backgroundColor: 'white',
    height: 40,
    borderWidth: 0.5,
    margin: 8,
    marginBottom: 0,
    paddingLeft: 8,
    paddingRight: 8,
    width: '60%',
    borderColor: '#C4C4C4',
  },

  redbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D21C43',
    height: 40,
    borderColor: 'grey',
    borderWidth: 0.3,
    margin: 8,
  },

  whitebutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 40,
    borderColor: '#D21C43',
    borderWidth: 0.3,
    margin: 8,
  },

  redSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D21C43',
    height: 40,
  },

  greySection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C4C4C4',
    height: 40,
  },

  greylabel: {
    width: '40%',
    marginTop:8,
    color: 'grey',
  },
});
