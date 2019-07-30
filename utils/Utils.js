import { Platform,} from 'react-native';

export default class CommonUtils {
  static _loadDataAsync = async () =>{

    Alert.alert('sadsad');
    const uri = 'http://py.itoe.ru:56503/worker/m/info/?id=29beee02-7b25-4314-b110-3042c67db300';
    let data  = '';

    try {
      let response = await fetch(uri);
      data = await response.text();
      if (Platform.OS === 'android') {
        data = data.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, '');
      }
    } catch (error) {

    }
    return (data);
  };
}
