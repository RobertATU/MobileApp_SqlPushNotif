import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native'
import { StyleSheet, Button, View, Alert, Platform,TextInput, Text, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { init, insertItem, fetchItems,deleteItem } from './sql';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import {useState} from 'react'
const Stack = createNativeStackNavigator()
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
 
  useEffect(() => {
    init()
      .then(() => {
        console.log('Initialized database');
      })
      .catch(err => {
        console.log('Initializing db failed.');
        console.log(err);
      });

    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission required',
          'Push notifications need the appropriate permissions.'
        );
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log(pushTokenData);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }

    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('NOTIFICATION RECEIVED');
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('NOTIFICATION RESPONSE RECEIVED');
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);


 


  return (
    <NavigationContainer>
    <Stack.Navigator>
      {/* <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Welcome' }}
      /> */}

<Stack.Screen
        name="List"
        component={ListScreen}
        options={{ title: 'Welcome' }}
      />
     <Stack.Screen
        name="Push"
        component={PushScreen}
        options={{ title: 'Welcome' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    marginBottom: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
const HomeScreen = ({ navigation }) => {
  return (
    <View>
    <Button
    title="Go to List Screen"
    onPress={() => navigation.navigate('List')
    }
  />
  <Button
    title="Go to Push Screen"
    onPress={() => navigation.navigate('Push')
    }
  />
  </View>
  )
}
const ListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  async function listAllRDBirecord() {
    let result = await fetchItems()
  
    console.log(JSON.stringify(result))
    setItems(result);
    setItemCount(result.length);
   
  }
  useEffect(() => {
    const newScreen = navigation.addListener('focus', () => {
      listAllRDBirecord();
    });

    return newScreen;
  }, [navigation]);
  const handleDeleteItem = async (id) => {
    await deleteItem(id);
    listAllRDBirecord();
  };
  return (
    <View >
         <Text >Total Items: {itemCount}</Text>
         <ScrollView>
         <View style={styles.container}>
    <Button
    title="Go to Push Screen"
    onPress={() => navigation.navigate('Push')
    }
  />
  
    <Button
      title="Get"
      onPress={listAllRDBirecord}
    />
    <View>
      <Text>Title:  </Text>
      {items.map((item) =>(
        <View key={item.id} style={styles.itemContainer}>
        <Text>{item.title + item.id}</Text>
        <Button title="Delete" onPress={() => handleDeleteItem(item.id)} />
        </View>
        ))}
    </View>
    <StatusBar style="auto" />
  </View>
  </ScrollView>
  </View>
  )
  
}


const PushScreen = ({ navigation }) => {
const [text2, onChangeText2] = useState('Useless Text');
const handleInsertAndNotify = async () => {
  scheduleNotificationHandlerInsert(text2);
 // sendPushNotificationHandlerInsert(text2);
  await insertItem({ title: text2 });
  navigation.navigate('List')
};

async function scheduleNotificationHandler() {
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'My first local notification',
      body: 'This is the body of the notification.',
      data: { userName: 'Max' },
    },
    trigger: {
      seconds: 5,
    },
  });
}

async function scheduleNotificationHandlerInsert(notificationBody) {
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Item added:',
      body: notificationBody,
      data: { userName: 'Max' },
    },
    trigger: {
      seconds: 5,
    },
  });
}

function sendPushNotificationHandler() {
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: 'ExponentPushToken[rO5-hoAgH9AhTCMpHdpyNu]',
      title: 'Test - sent from a device!',
      body: 'This is a push notification test!'
    })
  });
}

function sendPushNotificationHandlerInsert(notificationBody) {
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: 'ExponentPushToken[rO5-hoAgH9AhTCMpHdpyNu]',
      title: 'Item added:',
      body: notificationBody
    })
  });
}




 
  return (
    <View style={styles.container}>
 
     <Button
      title="Insert and Notify"
      onPress={handleInsertAndNotify}
    />  
   
      <View>
      <TextInput
      style={styles.input}
      value={text2}
      onChangeText={text2 => onChangeText2(text2)}
      placeholder="Please Enter Title"
    />
      </View>
    <StatusBar style="auto" />
  </View>
  )
}
