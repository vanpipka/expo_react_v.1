import React from 'react';

import {
  AsyncStorage,
  Button,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { CheckBox, ButtonGroup } from 'react-native-elements';
import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import Urls from '../constants/Urls';

const API = Urls.SERVER_URL+Urls.SELECTIONPARAMETERS_URL;

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Параметры поиска',
  };

  constructor(props) {
      super(props);

      const { navigation } = this.props;
      const data = navigation.getParam('data', {});
      this.state = {data: data, dataIsLoading: false, par: []};

      this.setListState = this.setListState.bind(this)

      this._loadParametersAsync();

  };

  setListState(selected){
    let searchParams = this.state.data;
    searchParams[selected.groupName] = selected.value;
    this.setState({data: searchParams});
  };

  setBooleanState(data){
    let searchParams = this.state.data;
    searchParams[data] = !searchParams[data];
    this.setState({data: searchParams});
  };

  render() {
      /* Go ahead and delete ExpoConfigView and replace it with your
      * content, we just wanted to give you a quick view of your config */

     if (!this.state.dataIsLoading) {
       return (<LoadingPage/>);
     }

     const { navigation } = this.props;

     parameters = this.state.par.map((item, index) => {
        if (item.type === 'ref') {
            return (null)
        }
        else if (item.type === 'boolean'){
            return (
              <CheckBox key={index}
                title = {item.title}
                checked={this.state.data[item.columnname]}
                checkedColor = {'#D21C43'}
                onPress={() => this.setBooleanState(item.columnname)}
            />)}
        else if (item.type === 'list') {
            return (
              <View key={index} style={{padding: 8}}>
                <Text style={{color: 'grey'}}>{item.title}</Text>
                <ButtonGroup
                  buttons={item.values}
                  onPress={this.setListState}
                  groupName = {item.columnname}
                  selectedIndex={this.state.data[item.columnname]}
                  selectedButtonStyle={{backgroundColor: '#D21C43'}}
                  containerStyle={{height: 40, alignItems: 'center', justifyContent: 'center',}}
                />
              </View>
            );
          }
        else {
          return (null);
          //return (<Text key={index}>{item.title},{item.type},{item.columnname}</Text>)
        };
     });

     return (
       <View style={styles.container}>
         <View style = {{backgroundColor:'grey', paddingBottom: 8}}>
           <TouchableOpacity onPress={() => this.props.navigation.navigate("SelectProfessionPage", {profession: this.state.data.profession, onGoBack: this._refreshProfession})}>
             <Text style={styles.textInput}>{this.state.data.profession === '' ? 'Введите профессию для поиска' : this.state.data.profession}</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => this.props.navigation.navigate("SelectCityPage", {city: this.state.data.city, onGoBack: this._refreshCity})}>
             <Text style={styles.textInput}>{this.state.data.city === '' ? 'Введите город для поиска' : this.state.data.city}</Text>
           </TouchableOpacity>
         </View>
         <ScrollView>
          {parameters}
         </ScrollView>
         <TouchableOpacity style={styles.redSection} onPress={() => {
                                         navigation.state.params.onGoBack(this.state.data)
                                         navigation.goBack()}}>
           <Text style={{color: 'white'}}>Продолжить</Text>
         </TouchableOpacity>
       </View>
     )
  }

  _loadParametersAsync = async () => {

    let url = this.state.url;
    if (url === ''){
      this.setState({dataIsLoading: true,})
    }
    else {
      let data = '';
      try {
        let response = await fetch(API);
        data = await response.text();
        if (Platform.OS === 'android') {
          data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
        }
      } catch (error) {
          this.setState({dataIsLoading: true});
          return;
      }

      let downloadData = JSON.parse(data);
      let searchParams = this.state.data;

      result = downloadData.searchparams.map((item, index) => {
        return ({title: item.title, type: item.type, columnname: item.columnname, values: item.values})
      });

      result.forEach(function(item, i, arr) {
        //Alert.alert( i + ": " + item + " (массив:" + arr + ")" );
        if (item.type === 'boolean') {
            searchParams[item.columnname] = searchParams[item.columnname];
        }
        else if (item.type === 'list') {
            searchParams[item.columnname] = searchParams[item.columnname] === undefined ? 0 : searchParams[item.columnname] ;
        }
        //searchParams.city = data;
      });

      searchParams.csrfmiddlewaretoken  = downloadData.csrfmiddlewaretoken;
      searchParams.csrftoken            = downloadData.csrftoken;

      this.setState({dataIsLoading: true, par: result, data: searchParams});

    }

  }

  _refreshCity=(data)=> {
    let searchParams = this.state.data;
    searchParams.city = data['name'];
    this.setState({data: searchParams});
  }

  _refreshProfession=(data)=> {
    let searchParams = this.state.data;
    searchParams.profession = data;
    this.setState({data: searchParams});
  }

}

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

});
