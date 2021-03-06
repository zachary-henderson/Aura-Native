import React, {useContext, useState, useEffect} from 'react';
import styled from 'styled-components';
import AsyncStorage from '@react-native-community/async-storage';
import {useNavigation} from '@react-navigation/native';
import {CircleContext, UserContext} from '../../context';
import {backendURL} from '../../config';
import MoodItem from './MoodItem';
import StyledButton from '../StyledButton';
import Empty from './Empty';

const AccountWrapper = styled.View`
  position: absolute;
  background-color: #fff;
  padding: 5px;
  padding-bottom: 89px;
  bottom: 0;
  border-radius: 10px;
  height: 80%;
  width: 100%;
  box-shadow: 0 2px 3px #222;
  align-items: center;
`;

const StyledFlatList = styled.FlatList`
  width: 110%;
`;

const Account = () => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const {setCircleText} = useContext(CircleContext);
  const {
    setCurrentUserId,
    setCurrentUserName,
    setCurrentUserNumber,
    currentUserId,
  } = useContext(UserContext);

  useEffect(() => {
    (async () => {
      await getData(0);
      setLoaded(true);
    })();
  }, []);

  const getData = async () => {
    const page = data.length;
    setRefreshing(true);
    const res = await fetch(
      `${backendURL}/mood/user/${currentUserId}/page/${page}`,
    );
    if (!res.ok) {
      const error = await res.json();
      setRefreshing(false);
      console.error(error);
      return;
    } else {
      const {moods} = await res.json();
      setRefreshing(false);
      setData([...data, ...moods]);
    }
  };

  const renderItem = (mood) => (
    <MoodItem
      data={data}
      length={data.length}
      setData={setData}
      mood={mood.item}
    />
  );

  const handleLogout = async () => {
    setCurrentUserNumber(null);
    setCurrentUserName(null);
    setCurrentUserId(null);
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{name: 'Auth'}],
    });
  };

  return (
    <AccountWrapper>
      <StyledButton onPress={handleLogout} title="Logout" />
      {loaded ? (
        <StyledFlatList
          contentContainerStyle={{
            width: '100%',
          }}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => `moodid-${index}`}
          ListEmptyComponent={<Empty />}
          onEndReached={getData}
          refreshing={refreshing}
        />
      ) : null}
    </AccountWrapper>
  );
};

export default Account;
