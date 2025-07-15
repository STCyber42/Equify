import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Favor } from '../favorModel';

export default function FavorListScreen() {
  const [favors, setFavors] = useState<Favor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | Favor['status']>('all');
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const fetchFavors = async () => {
        setLoading(true);
        try {
          const data = await AsyncStorage.getItem('favors');
          setFavors(data ? JSON.parse(data) : []);
        } catch (e) {
          setFavors([]);
        }
        setLoading(false);
      };
      fetchFavors();
    }, [])
  );

  const handleDelete = async (id: string) => {
    const filtered = favors.filter(f => f.id !== id);
    setFavors(filtered);
    await AsyncStorage.setItem('favors', JSON.stringify(filtered));
  };

  const filteredFavors = statusFilter === 'all' ? favors : favors.filter(f => f.status === statusFilter);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterRow}>
        {(['all', 'pending', 'completed', 'cancelled'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={statusFilter === s ? styles.filterTextActive : styles.filterText}>
              {s === 'all' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <Text style={styles.loading}>Memuat data favor...</Text>
      ) : filteredFavors.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Belum ada favor yang dicatat</Text>
          <Text style={styles.emptyDesc}>Catat favor pertama Anda untuk mulai menjaga keseimbangan hubungan!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavors}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: '/favorDetail', params: { id: item.id } })}>
              <View style={styles.item}>
                {item.proofImage ? (
                  <Image source={{ uri: item.proofImage }} style={styles.image} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.contact}>{item.contactName}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                  <Text style={[styles.meta, styles[`status_${item.status}`]]}>{item.date} | {item.status}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, marginBottom: 12, padding: 12 },
  image: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  contact: { fontWeight: 'bold', fontSize: 16 },
  desc: { color: '#374151', marginTop: 2 },
  meta: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  loading: { textAlign: 'center', marginTop: 40 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6B7280' },
  deleteBtn: { marginLeft: 8, backgroundColor: '#EF4444', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#374151' },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 260 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#ccc', marginHorizontal: 4 },
  filterBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  filterText: { color: '#333' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  status_pending: { color: '#F59E42' },
  status_completed: { color: '#10B981' },
  status_cancelled: { color: '#EF4444' },
}); 