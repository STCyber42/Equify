import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Favor, FavorStatus } from '../favorModel';

export default function FavorFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [contactName, setContactName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [proofImage, setProofImage] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<FavorStatus>('pending');
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [contactsModal, setContactsModal] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);

  React.useEffect(() => {
    if (id) {
      // Prefill data jika edit
      const fetchFavor = async () => {
        const data = await AsyncStorage.getItem('favors');
        const favors: Favor[] = data ? JSON.parse(data) : [];
        const found = favors.find(f => f.id === id);
        if (found) {
          setContactName(found.contactName);
          setDescription(found.description);
          setDate(found.date);
          setProofImage(found.proofImage);
          setStatus(found.status);
          setIsEdit(true);
        }
      };
      fetchFavor();
    }
  }, [id]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProofImage(result.assets[0].uri);
    }
  };

  const openContacts = async () => {
    setContactsLoading(true);
    setContactsModal(true);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
      setContacts(data);
    } else {
      setContacts([]);
    }
    setContactsLoading(false);
  };

  const handleSubmit = async () => {
    if (!contactName.trim() || !description.trim()) {
      alert('Nama kontak dan deskripsi wajib diisi!');
      return;
    }
    setSubmitting(true);
    try {
      const existing = await AsyncStorage.getItem('favors');
      let favors: Favor[] = existing ? JSON.parse(existing) : [];
      if (isEdit && id) {
        // Update favor
        favors = favors.map(f =>
          f.id === id
            ? { ...f, contactName, description, date, proofImage, status }
            : f
        );
        await AsyncStorage.setItem('favors', JSON.stringify(favors));
        alert('Favor diperbarui!');
      } else {
        // Tambah favor baru
        const newFavor: Favor = {
          id: Date.now().toString(),
          contactName,
          description,
          date,
          proofImage,
          status,
        };
        favors.push(newFavor);
        await AsyncStorage.setItem('favors', JSON.stringify(favors));
        alert('Favor dicatat!');
      }
      router.replace('/favorList');
    } catch (e) {
      alert('Gagal menyimpan favor!');
    }
    setSubmitting(false);
    setContactName('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setProofImage(undefined);
    setStatus('pending');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nama Kontak</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={contactName}
          onChangeText={setContactName}
          placeholder="Masukkan nama kontak"
        />
        <TouchableOpacity style={styles.contactBtn} onPress={openContacts}>
          <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Pilih dari Kontak</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={contactsModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Pilih Kontak</Text>
          {contactsLoading ? (
            <ActivityIndicator size="large" color="#10B981" />
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id ? item.id : String(item.name)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}
                  onPress={() => {
                    setContactName(item.name);
                    setContactsModal(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <Button title="Tutup" onPress={() => setContactsModal(false)} />
        </View>
      </Modal>
      <Text style={styles.label}>Deskripsi Favor</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Deskripsi singkat"
      />
      <Text style={styles.label}>Tanggal</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <Text style={styles.label}>Bukti (opsional)</Text>
      {proofImage ? (
        <Image source={{ uri: proofImage }} style={styles.image} />
      ) : null}
      <TouchableOpacity style={styles.button} onPress={handlePickImage}>
        <Text style={styles.buttonText}>Pilih/Gunakan Foto</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {(['pending', 'completed', 'cancelled'] as FavorStatus[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.statusButton, status === s && styles.statusButtonActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={status === s ? styles.statusTextActive : styles.statusText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title={submitting ? (isEdit ? 'Menyimpan...' : 'Mencatat...') : isEdit ? 'Simpan Perubahan' : 'Catat Favor'} onPress={handleSubmit} disabled={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginTop: 4 },
  button: { backgroundColor: '#10B981', padding: 10, borderRadius: 8, marginVertical: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  image: { width: 120, height: 120, marginVertical: 8, borderRadius: 8 },
  statusRow: { flexDirection: 'row', marginVertical: 8 },
  statusButton: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  statusButtonActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  statusText: { color: '#333' },
  statusTextActive: { color: '#fff', fontWeight: 'bold' },
  contactBtn: { marginLeft: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#10B981' },
}); 