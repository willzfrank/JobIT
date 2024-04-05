import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  VirtualizedList,
} from 'react-native';
import * as Location from 'expo-location';

import styles from './nearbyjobs.style';
import { COLORS } from '../../../constants';
import NearbyJobCard from '../../common/cards/nearby/NearbyJobCard';
import useFetch from '../../../hook/useFetch';

const Nearbyjobs = () => {
  const router = useRouter();
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { data, isLoading, error } = useFetch('search', {
    query: `${address}`,
    num_pages: '100',
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let addressInfo = await Location.reverseGeocodeAsync(location.coords);
      const formattedAddress = `${addressInfo[0]?.subregion}`;
      setAddress(formattedAddress);
    })();
  }, []);

  const renderJobCard = ({ item }) => (
    <NearbyJobCard
      job={item}
      key={`nearby-job-${item.job_id}`}
      handleNavigate={() => router.push(`/job-details/${item.job_id}`)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby jobs</Text>
        <TouchableOpacity>
          <Text style={styles.headerBtn}>Show all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <Text>Something went wrong</Text>
        ) : (
          <VirtualizedList
            data={data}
            renderItem={renderJobCard}
            keyExtractor={(item) => `${item.job_id}`}
            getItemCount={() => data.length}
            getItem={(data, index) => data[index]}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
          />
        )}
      </View>
    </View>
  );
};

export default Nearbyjobs;
