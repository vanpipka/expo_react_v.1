import React from 'react';
import {
  AsyncStorage,
  Button,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Alert,
  Image,
  Platform,
  Linking
} from 'react-native';

import { GetQueryResult } from '../components/WebAPI';
import StarRating from '../components/Rating';
import { Icon } from 'expo';
import { Icon as IconEl } from 'react-native-elements' ;
import ProfessionsScreen from '../screens/ProfessionsScreen';
import CitysScreen from '../screens/CitysScreen';
import SearchParametersScreen from '../screens/SearchParametersScreen';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import SettingsScreen from '../screens/SettingsScreen';
import Background from '../images/bg.png';
import Utils from '../utils/Utils';
import Urls from '../constants/Urls';

import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

class AuthLoadingScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {result: 0, data: ''};
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const URI = Urls.SERVER_URL+Urls.PROFESSIONANDGROUPS_URL;
    let data  = await GetQueryResult({method: 'GET', url: URI});
    this.props.navigation.navigate('Main', {data: JSON.stringify(data)});
  };

  // Render any loading content that you like here
  render() {

    const result = this.state.result;
    //Alert.alert('3.'+result);
    switch (result) {
      case 1:
        return (
          <ErrorPage/>
        );
        break;
      case 2:
        return (
          <ErrorPage/>
        )
        break;
      default:
        return (
          <LoadingPage/>
        );
    }

  }
}

class MainPageScreen extends React.Component {

  static navigationOptions = {
    title: 'Поиск сотрудников',
  }

  constructor(props) {
      super(props);

      const { navigation } = this.props;
      const data = navigation.getParam('data', '{"dataset": []}');

      this.state = {
          profession: navigation.getParam('profession', ''),
          city: navigation.getParam('city', ''),
          data: JSON.parse(data)
      };
  }

  render() {

    var buttonPanel = this.renderGroups(this.state.data);

    return (
      <View style={styles.container}>
        <View style = {{backgroundColor:'grey'}}>
          <Text style = {{marginLeft:8, marginRight:8,marginTop:8, color: 'white'}}>
            Найти сотрудников для работы на выставке (v.: 0.0.6)
          </Text>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("SelectProfessionPage", {profession: this.state.profession, onGoBack: this._refreshProfession})}>
            <Text style={styles.textInput}>{this.state.profession === '' ? 'Введите профессию для поиска' : this.state.profession}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.props.navigation.navigate("SelectCityPage", {city: this.state.city, onGoBack: this._refreshCity})}>
            <Text style={styles.textInput}>{this.state.city === '' ? 'Введите город для поиска' : this.state.city}</Text>
          </TouchableOpacity>

          <TouchableOpacity //
            onPress={() => this.props.navigation.navigate("WorkerList", {profession: this.state.profession, city: this.state.city})}
            style={styles.redbutton}>
            <Text style={{color: 'white',}}>НАЙТИ</Text>
          </TouchableOpacity>

        </View>
        <ScrollView  style = {{marginLeft:8, marginRight:8, zIndex: 0.9}}>
          {buttonPanel}
        </ScrollView>
        <Text></Text>
      </View>
    );
  }

  renderGroups(data) {
    const list = data.dataset.map((item, index) => {
      const profession = this.renderProfessions(item.items);
      return (
        <View key={item.id} style={{marginTop:8,}}>
          <View>
            <Text style={{color:'#D21C43', fontWeight: 'bold', marginBottom: 8}}>{item.name}</Text>
          </View>
          {profession}
        </View>
      )
    });
    return <View style= {{zIndex: 1}}>{list}</View>;
  }

  renderProfessions(data) {
    const list = data.map((item, index) => {
      return (
        <TouchableOpacity key={item.id} style={{flexDirection: 'row'}}
          onPress={() => this.props.navigation.navigate("WorkerList", {profession: item.name})}>
          <Text style={{width: '93%'}}>
            {item.name}
          </Text>
          <View style={{backgroundColor: 'grey', justifyContent: 'center', alignItems: 'center', width: '7%', marginTop: 2,}}>
            <Text style = {{color: 'white', marginLeft: 4, marginRight: 4, textAlign: 'center', fontWeight: 'bold'}}>
              {item.workercount}
            </Text>
          </View>
        </TouchableOpacity>
      )
    });
    return <View>{list}</View>;
  }

  _refreshCity=(data)=> {
    this.setState({city: data['name']})
  }

  _refreshProfession=(data)=> {
    this.setState({profession: data})
  }

}

class WorkerListScreen extends React.Component {
  static navigationOptions = {
    title: 'Список сотрудников',
  };

  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const searchParams = {'profession': navigation.getParam('profession', ''),
                          'city': navigation.getParam('city', ''),};

    this.state = { dataIsLoading: false, data: '{"dataset": []}', searchParams: searchParams};

    // Toggle the state every second
    this._searchParamsAsync();

  }

  render() {

    if (!this.state.dataIsLoading) {
      return (<LoadingPage/>);
    }

    WorkerList = this.RenderWorkerList();

    return (
      <View styles={styles.container}>
        <TouchableOpacity style={styles.redSection}
           onPress={() => this.props.navigation.navigate("SearchParametersPage", {'data': this.state.searchParams, 'onGoBack': this._refreshSearchParameters})} >
          <Text style={{color: 'white'}}>Расширенный поиск</Text>
        </TouchableOpacity>
        <ScrollView>
          {WorkerList}
          <View style={{height:50}}>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.fabMenuStyle}
          onPress={() => {this.setState({dataIsLoading: false,}); this._searchParamsAsync()}}>
          <IconEl
            reverse
            size={20}
            name='md-sync'
            type='ionicon'
            color='#D21C43'
            />
        </TouchableOpacity>
      </View>
    );

  }

  RenderWorkerList(){

    const dataString = this.state.data;

    if (dataString == '') {
      return(
        <View style={{flex: 1,alignItems: 'center',justifyContent: 'center',}}>
          <Text style={{color: 'grey'}}>По вашему запросу ничего не найдено</Text>
        </View>
      )
    }

    try {
      const dataJson = JSON.parse(this.state.data);
      const list = dataJson.dataset.map((item, index) => {
        //const profession = this.renderProfessions(item.items);
        let photoSource     = this.GetFotoURL(item['resizefotourl']);
        let name            = item['surname'] + ' ' + item['name'];
        let city            = item['city']['name'];
        let isOnline        = item['isonline'] ? this.GetLabel(text='онлайн', color={backgroundColor:'#95CCA2'})  : null;
        let experienceyear  = item['experienceyear'];
        let url             = item['url_json'];
        let dataCheck       = false;
        let dataCheckIcon   = null;
        let attributeslist  = item['attributes'];
        let professions     = this.GetProfessionList(item['proflist']);
        let attributes      = null;
        let rating          = this.GetRating(rating=item['rating'], commentscount=item['commentscount']);

        if (attributeslist != undefined) {
            attributes = attributeslist.map((item, index) => {

              if (item.name == 'datacheck') {
                  dataCheck = item['value'];
              }

              color = item['value'] == true ? {backgroundColor:'#95CCA2'} : {backgroundColor:'#C4C4C4'}
              return (<View style={{marginRight:8, marginTop:4}}key={item.name}>{this.GetLabel(item.label, color=color)}</View>);//<Text key={item.name}>{item.label}, </Text>)
            });
        };

        if (dataCheck == true) {
          dataCheckIcon = <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-checkmark-circle': 'md-checkmark-circle'} size={26} color={'#95CCA2'}/>
        }

        return (
          <TouchableOpacity key={item.id} style={{margin:8, borderWidth:1, borderColor: '#E5E5E5'}} onPress={() => this.props.navigation.navigate("WorkerInfo", {url: url})}>
            <ImageBackground resizeMode='contain' source = {photoSource} style={{width:'100%', height: 150,}}>
              <View style={{flex:1, alignItems: 'flex-end', marginRight: 10, marginTop: 8,}}>
                {dataCheckIcon}
              </View>
              {rating}
            </ImageBackground>
            <View style={{margin:8}}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{color:'#D21C43', fontWeight: 'bold', marginTop: 8, width: '80%'}}>{name}</Text>
                <View style={{flex: 1, alignItems: 'flex-end', marginTop:8,}}>
                  {isOnline}
                </View>
              </View>
              <Text style={{color:'grey', fontWeight: '100'}}>{city}</Text>
              <View style={{flexWrap: 'wrap', flexDirection: 'row', flex: 1,}}>
                {professions}
              </View>
              <Text style={{color:'grey',}}>Стаж {experienceyear} лет</Text>
              <View style={{flexWrap: 'wrap', flexDirection: 'row', flex: 1,}}>
                {attributes}
              </View>
            </View>
          </TouchableOpacity>
        )
      });
      return <View>{list}</View>;
    } catch (e) {
        return(<ErrorPage/>);//
    }

  }

  GetRating(rat, comments){

    let rating          = parseFloat(rat).toFixed(1);
    let commentscount   = comments == '0' ? 'нет отзывов' : comments + ' отзывов';

    return (
      <View style={{width:'40%', height: 40, backgroundColor: 'rgba(229, 229, 229, 1)', margin:8, flexDirection: 'row'}}>
          <View style={{height:'100%', justifyContent: 'center',}}>
            <Text style={{color: 'grey', fontSize: 20, fontWeight: 'bold', marginLeft:8,}}>{rating}</Text>
          </View>
          <View style={{height:'100%', justifyContent: 'center', marginLeft:8, marginRight:8,}}>
            <StarRating ratingObj={{ratings: rating,  views: 34000 }} />
            <Text style={{}}>{commentscount}</Text>
          </View>
      </View>
    )

  }

  GetProfessionList(proflist){

    let professions = null;
    if (proflist != undefined) {
        professions = proflist.map((item, index) => {
          return (<Text key={item.id}>{item.name}, </Text>)
        });
    };
    return professions;
  }

  GetLabel(text, color){
    return(
      //, {justifyContent: 'center', alignItems: 'center', marginTop:8,}}>
      <View style={[color]}>
        <Text style = {{color: 'white', marginLeft: 4, marginRight: 4, textAlign: 'center'}}>
          {text}
        </Text>
      </View>
    )
  }

  GetFotoURL(url){

    if (url == '/static/main/img/add-photo.png'){
        return (photoSource = require('../images/nofoto.png'))
    }

    const API = url;

    return (photoSource = {uri: API})
  }

  _refreshSearchParameters = (data)=> {
      this.setState({searchParams: data, dataIsLoading: false,});
      this._searchParamsAsync();
  }

  _searchParamsAsync = async () => {

    const URI         = Urls.SERVER_URL+Urls.WORKERSEARCH_URL;
    let searchParams  = this.state.searchParams;

    searchParams['positionfrom'] = 0;
    searchParams['positionto'] = 500;

    body = encodeURIComponent('data') + '=' + encodeURIComponent(JSON.stringify(searchParams)) +
      '&'+encodeURIComponent('csrfmiddlewaretoken') + '=' + encodeURIComponent(await AsyncStorage.getItem('csrfmiddlewaretoken'))+'';

    let data  = await GetQueryResult({method: 'POST', url: URI, body: body});

    this.setState({dataIsLoading: true, data: JSON.stringify(data)})

  };
}

class WorkerInfoScreen extends React.Component {

  static navigationOptions = {
    title: 'Информация о сотруднике',
  };

  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const url = navigation.getParam('url', '');

    this.state = {dataIsLoading: false, url: url, data: '{"dataset": []}', fotourl:''};

    this._searchParamsAsync();

  }

  render() {

    if (!this.state.dataIsLoading) {
      return (<LoadingPage/>);
    }

    WorkerInfo = this.RenderWorkerInfo();

    return (
      <View style={styles.container}>
        {WorkerInfo}
        <TouchableOpacity style={styles.fabMenuStyle}
          onPress={this._NewMessageAsync}>
          <IconEl
            reverse
            size={20}
            name={ Platform.OS === 'ios' ? 'ios-chatbubbles' : 'md-chatbubbles' }
            type='ionicon'
            color='#D21C43'
            />
        </TouchableOpacity>
      </View>
    );

  }

  RenderWorkerInfo(){

    const dataString = this.state.data;

    if (dataString == '') {
      return(
        <View style={{flex: 1,alignItems: 'center',justifyContent: 'center',}}>
          <Text style={{color: 'grey'}}>По вашему запросу ничего не найдено</Text>
        </View>
      )
    }

    try {
      const dataJson = JSON.parse(this.state.data);
      const list = dataJson.dataset.map((item, index) => {
        //const profession = this.renderProfessions(item.items);
        let photoSource     = this.GetFotoURL(item['resizefotourl']);
        let name            = item['surname'] + ' ' + item['name'];
        let city            = item['city']['name'];
        let isOnline        = item['isonline'] ? this.GetLabel(text='онлайн', color={backgroundColor:'#95CCA2'})  : null;
        let experienceyear  = item['experienceyear'];
        let dataCheck       = false;
        let dataCheckIcon   = null;
        let professions     = this.GetProfessionList(item['proflist']);
        let attributes      = null;
        let rating          = this.GetRating(rating=item['rating'], commentscount=item['commentscount']);
        let attributeslist  = item['attributes'];
        let phoneNumber     = item['phonenumber'] === '' ? 'не указан': item['phonenumber'];
        let emailaddress    = item['emailaddress'] === '' ? 'не указана': item['emailaddress'];
        let experience      = this.GetTextBlock(text = item['experience'], article='Опыт работы на выставках');
        let description     = this.GetTextBlock(text = item['description'], article='О себе');
        let priceList       = this.GetPriceList(works = item['works']);

        if (attributeslist != undefined) {
            attributes = attributeslist.map((item, index) => {

              if (item.name == 'datacheck') {
                  dataCheck = item['value'];
              }

              color = item['value'] == true ? {backgroundColor:'#95CCA2'} : {backgroundColor:'#C4C4C4'}
              return (<View style={{marginRight:8, marginTop:4}}key={item.name}>{this.GetLabel(item.label, color=color)}</View>);//<Text key={item.name}>{item.label}, </Text>)
            });
        };

        if (dataCheck == true) {
          dataCheckIcon = <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-checkmark-circle': 'md-checkmark-circle'} size={26} color={'#95CCA2'}/>
        }

        return (
            <View key = {item.id} style={{margin:8}}>
              <ImageBackground resizeMode='contain' source = {photoSource} style={{width:'100%', height: 150,}}>
                <View style={{flex:1, alignItems: 'flex-end', marginRight: 10, marginTop: 8,}}>
                  {dataCheckIcon}
                </View>
                {rating}
              </ImageBackground>
              <View style={{backgroundColor: '#D1ECF1', padding:8,}}>
                <View style={{flexDirection: 'row'}}>
                  <Icon.Ionicons style={{width: '10%'}} name={Platform.OS === 'ios' ? 'ios-phone-portrait': 'md-phone-portrait'} size={20} color={'grey'}/>
                  <Text onPress = {() => {Linking.openURL(`tel:${phoneNumber}`)}}  style={{color: 'grey', width: '90%'}}>{phoneNumber}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Icon.Ionicons style={{width: '10%'}} name={Platform.OS === 'ios' ? 'ios-mail': 'md-mail'} size={20} color={'grey'}/>
                  <Text style={{color: 'grey', width: '90%'}}>{emailaddress}</Text>
                </View>
              </View>
              <View style={{margin:8, marginTop:0}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{color:'#D21C43', fontWeight: 'bold', marginTop: 8, width: '80%'}}>{name}</Text>
                  <View style={{flex: 1, alignItems: 'flex-end', marginTop:8,}}>
                    {isOnline}
                  </View>
                </View>
                <Text style={{color:'grey', fontWeight: '100'}}>{city}</Text>
                <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
                  {professions}
                </View>
                <Text style={{color:'grey',}}>Стаж {experienceyear} лет</Text>
                <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
                  {attributes}
                </View>
              </View>
              <View style={{ borderBottomWidth:1, borderBottomColor: 'white'}}/>
              {priceList}
              <View style={{ borderBottomWidth:1, borderBottomColor: 'white'}}/>
              {experience}
              {description}
            </View>
        )
      });
      return <View>{list}</View>;
    } catch (e) {
        return(<ErrorPage/>);//
    }

  }

  GetPriceList(works){

    let priceList = works['servicelist'];
    let salary = works['salary'];

    if (priceList === undefined && salary === undefined) {
      return null;
    }

    let professions = priceList.map((item, index) => {
        return (
          <View key={item.id} style={{flexDirection: 'row',flexGrow: 1}}>
            <Text style={{}}>{item.service}</Text>
            <View style={{marginLeft:4, marginRight:4, marginBottom:8, flexGrow: 1,borderBottomWidth:0.5, borderStyle: 'dotted', borderBottomColor: '#C4C4C4'}}/>
            <Text>{item.price} р.</Text>
          </View>
        )
    });

    return(<View style={{padding: 8}}>
              <Text style={{color: 'grey', flexGrow: 1}}>Услуги и цены</Text>
              <View key={'BYg87guu'} style={{flexDirection: 'row',flexGrow: 1}}>
                <Text style={{}}>Полная занятость</Text>
                <View style={{marginLeft:4, marginRight:4, marginBottom:8, flexGrow: 1,borderBottomWidth:0.5, borderStyle: 'dotted', borderBottomColor: '#C4C4C4'}}/>
                <Text>{salary} р.</Text>
              </View>
              {professions}
           </View>);
  }

  GetTextBlock(text, article){

    return(text === undefined || text === '' ? null: <View style={{padding: 8,}}>
                                                            <Text style={{color: 'grey'}}>{article}</Text>
                                                            <Text style={{}}>{text}</Text>
                                                          </View>);
  }

  GetRating(rat, comments){

    let rating          = parseFloat(rat).toFixed(1);
    let commentscount   = comments == '0' ? 'нет отзывов' : comments + ' отзывов';

    return (
      <View style={{width:'40%', height: 40, backgroundColor: 'rgba(229, 229, 229, 1)', margin:8, flexDirection: 'row'}}>
          <View style={{height:'100%', justifyContent: 'center',}}>
            <Text style={{color: 'grey', fontSize: 20, fontWeight: 'bold', marginLeft:8,}}>{rating}</Text>
          </View>
          <View style={{height:'100%', justifyContent: 'center', marginLeft:8, marginRight:8,}}>
            <StarRating ratingObj={{ratings: rating,  views: 34000 }} />
            <Text style={{}}>{commentscount}</Text>
          </View>
      </View>
    )

  }

  GetProfessionList(proflist){

    let professions = null;
    if (proflist != undefined) {
        professions = proflist.map((item, index) => {
          return (<Text key={item.id}>{item.name}, </Text>)
        });
    };
    return professions;
  }

  GetLabel(text, color){
    return(
      //, {justifyContent: 'center', alignItems: 'center', marginTop:8,}}>
      <View style={[color]}>
        <Text style = {{color: 'white', marginLeft: 4, marginRight: 4, textAlign: 'center'}}>
          {text}
        </Text>
      </View>
    )
  }

  GetFotoURL(url){

    if (url == '/static/main/img/add-photo.png'){
        return (photoSource = require('../images/nofoto.png'))
    }
    const uri = url;
    return {uri: uri}
  }

  _searchParamsAsync = async () => {

    const URI = Urls.SERVER_URL+this.state.url;
    let data  = await GetQueryResult({method: 'GET', url: URI});

    this.setState({dataIsLoading: true, data: JSON.stringify(data)});

  };
}

const AuthStack = createStackNavigator({  Main: MainPageScreen,
                                          WorkerList: WorkerListScreen,
                                          WorkerInfo:WorkerInfoScreen,
                                          LoadingPage: AuthLoadingScreen,
                                          SelectCityPage: CitysScreen,
                                          SelectProfessionPage:  ProfessionsScreen,
                                          SearchParametersPage: SearchParametersScreen,});

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  textInput: {
    backgroundColor: 'white',
    paddingTop: 10,
    height: 40,
    color: '#C4C4C4',
    borderColor: 'gray',
    borderWidth: 1,
    margin: 8,
    marginBottom: 0,
    paddingLeft: 8,
    paddingRight: 8,
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

  redSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D21C43',
    height: 40,

  },

  fabMenuStyle: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: '#D21C43',
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 0.5,
    bottom: 48,
    right: 8,
    justifyContent: 'flex-end'
  },

});
