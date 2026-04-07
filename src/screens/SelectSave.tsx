import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { GameSave } from '../types/save';

interface SelectSaveProps {
  saves: (GameSave | null)[];
  onSelectSlot: (slotId: number) => void;
}

const SelectSave = ({ saves, onSelectSlot }: SelectSaveProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CHOOSE SAVE SLOT</Text>
      {[1, 2, 3].map((slotId) => {
        const saveData = saves.find(s => s?.slotId === slotId);
        return (
          <TouchableOpacity 
            key={slotId} 
            style={styles.slotCard} 
            onPress={() => onSelectSlot(slotId)}
          >
            <Text style={styles.slotNumber}>SAVE {slotId}</Text>
            {saveData ? (
              <View>
                <Text style={styles.saveInfo}>{saveData.city}</Text>
                <Text style={styles.saveStats}>{saveData.wins}-{saveData.losses}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>[ EMPTY SLOT ]</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 40, letterSpacing: 2 },
  slotCard: { 
    borderWidth: 2, borderColor: '#EEE', padding: 25, borderRadius: 12, 
    marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  slotNumber: { fontWeight: 'bold', color: '#888' },
  saveInfo: { fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
  saveStats: { fontSize: 14, color: '#666', textAlign: 'right' },
  emptyText: { color: '#CCC', fontStyle: 'italic' }
});

export default SelectSave;