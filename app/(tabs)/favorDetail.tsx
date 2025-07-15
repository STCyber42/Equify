import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import { Favor } from '../favorModel';

export default function FavorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [favor, setFavor] = useState<Favor | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFavor = async () => {
      setLoading(true);
      try {
        const data = await AsyncStorage.getItem('favors');
        const favors: Favor[] = data ? JSON.parse(data) : [];
        const found = favors.find(f => f.id === id);
        setFavor(found || null);
      } catch (e) {
        setFavor(null);
      }
      setLoading(false);
    };
    fetchFavor();
  }, [id]);

  if (loading) return <Text style={styles.loading}>Memuat detail favor...</Text>;
  if (!favor) return <Text style={styles.empty}>Favor tidak ditemukan.</Text>;

  return (
    <View style={styles.container}>
      {favor.proofImage && <Image source={{ uri: favor.proofImage }} style={styles.image} />}
      <Text style={styles.contact}>{favor.contactName}</Text>
      <Text style={styles.desc}>{favor.description}</Text>
      <Text style={styles.meta}>{favor.date} | {favor.status}</Text>
      <Button title="Edit" onPress={() => router.push({ pathname: '/favorForm', params: { id: favor.id } })} />
      <Button title="Kembali" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  image: { width: 120, height: 120, borderRadius: 12, marginBottom: 16 },
  contact: { fontWeight: 'bold', fontSize: 22, marginBottom: 8 },
  desc: { color: '#374151', fontSize: 16, marginBottom: 8 },
  meta: { color: '#6B7280', fontSize: 14, marginBottom: 24 },
  loading: { textAlign: 'center', marginTop: 40 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6B7280' },
}); 