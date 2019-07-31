import * as React from 'react';
import { Platform, Alert, AsyncStorage } from 'react-native';
import Urls from '../constants/Urls';

export function AssetExample(props) {
  return 'Привет всем присутствующим!';
}

function GetHeaders(props) {

  let headers = {};

  headers["Upgrade-Insecure-Requests"] = "1";
  headers["X-Requested-With"] = "XMLHttpRequest";
  headers["Cookie"]           = "csrftoken="+props.csrftoken+"; sessionid="+props.sessionid;
  headers["Accept"]           = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
  headers["_ga"]              = "GA1.2.92399148.1551296291";
  headers["pjAcceptCookie"]   = "YES";
  headers["Accept-Encoding"]  = "gzip, deflate";
  headers["Accept-Language"]  = "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3";
  headers["Cache-Control"]    =	"max-age=0";
  headers["Connection"]       = "keep-alive";
  headers["Content-Type"]     = "application/x-www-form-urlencoded";
  headers["User-Agent"]       = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
  headers["withCredentials"]  = true;
  headers['Cache-Control']    = 'no-cache';
  headers['Referer']          = Urls.SERVER_URL;

  return headers;

}

export function GetQueryResult(props) {

  if (props.url == null){
    return {'error': 'resource address is not specified'}
  }

  let method  = (props.method != null) ? props.method : 'GET';
  let url     = (props.url != null) ? props.url : MAIN_URL;
  let body    = (props.body != null) ? props.body : {};

  let parameters  = {};
  let jsondata    = _getTokenAsync({url: url, method: method, body: body});

  return jsondata

}

_getTokenAsync = async (props) => {

    let response  = null;
    let csrftoken = await AsyncStorage.getItem('csrftoken');
    let sessionid = await AsyncStorage.getItem('sessionid');
    let headers   = GetHeaders({csrftoken: csrftoken, sessionid: sessionid});

    if (props.method === 'GET'){
        response  = await fetch(props.url, {method: 'GET', headers: headers});
    }
    else{
        response  = await fetch(props.url, {method: 'POST', body: props.body, headers: headers});
    }

    let data      = await response.text();
    let dataJSON  = {};

    if (Platform.OS === 'android') {
      data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
    };

    try {
      dataJSON = JSON.parse(data);
      _setSessionInfo(dataJSON);
    } catch (e) {
      //не обрабатываем
      console.log('Ответ сервера: '+data)
      Alert.alert('Ошибка')
    }

    return dataJSON
}

_setSessionInfo = async (dataJSON) => {

  let cookies = {};

  if (dataJSON['cookies'] != undefined) { cookies = dataJSON['cookies'];}

  if (cookies['csrfmiddlewaretoken'] != null) {
    await AsyncStorage.setItem("csrfmiddlewaretoken", cookies['csrfmiddlewaretoken'])
  };
  if (cookies['csrftoken'] != null) {
    await AsyncStorage.setItem("csrftoken", cookies['csrftoken'])
  };
  if (cookies['sessionid'] != null) {
    await AsyncStorage.setItem("sessionid", cookies['sessionid'])
  };

}
