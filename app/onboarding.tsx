import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const slides = [
  {
    key: 'splash',
    title: 'Selamat Datang di Equify',
    description: 'Aplikasi untuk menjaga keseimbangan hubungan dan timbal balik dengan bantuan AI.',
    image: require('../assets/images/react-logo.png'), // Fallback ke react-logo
  },
  {
    key: 'tutorial1',
    title: 'Catat Favor dengan Mudah',
    description: 'Swipe kanan/kiri untuk mencatat favor, gunakan kamera untuk scan bukti, dan tambahkan deskripsi singkat.',
    image: require('../assets/images/partial-react-logo.png'), // Fallback ke partial-react-logo
  },
  {
    key: 'tutorial2',
    title: 'Pantau Keseimbangan Hubungan',
    description: 'Lihat skor keseimbangan, insight AI, dan saran tindakan langsung di dasbor.',
    image: require('../assets/images/react-logo.png'), // Fallback ke react-logo
  },
  {
    key: 'tutorial3',
    title: 'Notifikasi Pintar',
    description: 'Dapatkan pengingat kontekstual untuk reciprocate dan momen spesial.',
    image: require('../assets/images/partial-react-logo.png'), // Fallback ke partial-react-logo
  },
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [importedContacts, setImportedContacts] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else if (!importedContacts) {
      // Import kontak utama
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
        // Filter dan simpan kontak utama (dummy, implementasi lanjut di fitur kontak)
        setImportedContacts(true);
      }
    } else if (!notificationGranted) {
      // Minta izin notifikasi
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationGranted(true);
      }
    } else {
      // Selesai onboarding, arahkan ke Home
      router.replace('/(tabs)');
    }
  };

  const getButtonText = () => {
    if (step < slides.length - 1) return 'Lanjut';
    if (!importedContacts) return 'Impor Kontak Utama';
    if (!notificationGranted) return 'Aktifkan Notifikasi';
    return 'Mulai';
  };

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <Image source={slides[step].image} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>{slides[step].title}</Text>
        <Text style={styles.description}>{slides[step].description}</Text>
      </View>
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, step === i && styles.activeDot]} />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 48,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F8FAFC',
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#10B981',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 