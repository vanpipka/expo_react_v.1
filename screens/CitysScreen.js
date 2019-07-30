import Autocomplete from '../components/Autocomplete';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';

import LoadingPage from '../screens/LoadingPage';
import ErrorPage from '../screens/ErrorPage';
import Urls from '../constants/Urls';

const API = Urls.SERVER_URL+Urls.CITY_LIST_URL;

class MyListItem extends React.PureComponent {

  _onPress = () => {
    this.props.onPressItem(this.props);
  };

  render() {
    return (
      <View style={{ borderBottomWidth:1, borderBottomColor: '#C4C4C4'}}>
        <TouchableOpacity onPress={this._onPress} style={{margin:8}}>
          <View style={{height: 40, justifyContent: 'center', }}>
            <Text style={{  }}>
              {this.props.title}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default class LinksScreen extends React.Component {

  static navigationOptions = {
    title: 'Город',
  };

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    this.state = {citys: [], query: navigation.getParam('city', ''), query_id: navigation.getParam('city_id', ''), dataIsLoading: false};

    this._loadCityAsync();
  }

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (props) => {
    this.setState({query: props.title, query_id: props.id});
  };

  _loadCityAsync = async () => {
    
      let data = '';
      try {
        let response = await fetch(API);
        data = await response.text();
        if (Platform.OS === 'android') {
          data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
        }
      } catch (error) {
          this.setState({dataIsLoading: true});
      }

      result = JSON.parse(data).dataset.map((item, index) => {
        return ({title: item.name, id: item.id})
      });

      this.setState({citys:  result, dataIsLoading: true});
  }

  _renderItem = ({item}) => (
      <MyListItem
        id = {item.id}
        onPressItem={this._onPressItem}
        title={item.title}
      />
    );

  findCity(query) {
    const { citys } = this.state;

    if (query === '') {
      return citys;
    }

    const regex = new RegExp(`${query.trim()}`, 'i');
    return citys.filter(city => city.title.search(regex) >= 0);
  }

  render() {

    if (!this.state.dataIsLoading) {
      return (<LoadingPage/>);
    }

    //const { goBack } = this.props.navigation;
    const { navigation } = this.props;

    const { query } = this.state;
    const citys = this.findCity(query);

    return (
          <View style={styles.container}>
            <View style = {{backgroundColor:'grey', padding: 8}}>
              <TextInput
                style={styles.textInput}
                onChangeText={(query) => this.setState({query})}
                value={this.state.query}
                placeholder = 'Введите город для поиска'
              />
            </View>
            <FlatList
              data={citys}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
            <TouchableOpacity style={styles.redSection} onPress={() => {
                                            navigation.state.params.onGoBack({'name': this.state.query, 'id': this.state.query_id})
                                            navigation.goBack()}}>
              <Text style={{color: 'white'}}>Продолжить</Text>
            </TouchableOpacity>
          </View>
    );
  }
}

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
  },

  redSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D21C43',
    height: 40,
  },

});
