import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const [favorCount, setFavorCount] = useState(0);
  const [balanceScore, setBalanceScore] = useState(0);
  const [insight, setInsight] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const fetchFavors = async () => {
        const data = await AsyncStorage.getItem('favors');
        const favors = data ? JSON.parse(data) : [];
        setFavorCount(favors.length);
        // Dummy score: semakin banyak favor, skor turun
        const score = Math.max(100 - favors.length * 10, 0);
        setBalanceScore(score);
        let insightMsg = '';
        let emoji = '';
        if (score > 80) {
          insightMsg = 'Hubungan sangat seimbang, pertahankan!';
          emoji = '🟢😊';
        } else if (score > 60) {
          insightMsg = 'Hubungan cukup seimbang, tetap jaga komunikasi.';
          emoji = '🟡🙂';
        } else if (score > 40) {
          insightMsg = 'Mulai ada ketimpangan, perhatikan reciprocate.';
          emoji = '🟠🤔';
        } else if (score > 20) {
          insightMsg = 'Hubungan kurang seimbang, lakukan aksi timbal balik!';
          emoji = '🔴😟';
        } else {
          insightMsg = 'Ayo perbaiki hubungan, lakukan favor untuk menyeimbangkan!';
          emoji = '⚫️😢';
        }
        setInsight(`${emoji} ${insightMsg}`);
      };
      fetchFavors();
    }, [])
  );

  const isEmpty = favorCount === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Keseimbangan</Text>
      {isEmpty ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🤝</Text>
          <Text style={styles.emptyTitle}>Belum ada favor</Text>
          <Text style={styles.emptyDesc}>Catat favor pertama Anda untuk mulai menjaga dan menyeimbangkan hubungan!</Text>
        </View>
      ) : (
        <>
          <Text style={styles.score}>Skor: {balanceScore}</Text>
          <Text style={styles.insight}>{insight}</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Favor Dicatat:</Text>
            <Text style={styles.summaryValue}>{favorCount}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  score: { fontSize: 40, fontWeight: 'bold', color: '#0a7ea4', marginBottom: 16 },
  insight: { fontSize: 16, color: '#374151', marginBottom: 32, textAlign: 'center' },
  summaryBox: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 20, alignItems: 'center' },
  summaryLabel: { fontSize: 16, color: '#6B7280' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: '#0a7ea4' },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#374151' },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 260 },
});
