import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';

interface SelectSaveProps {
  saves: (GameSave | null)[];
  onSelectSlot: (slotId: number) => void;
  onDeleteSlot: (slotId: number) => void;
}

const SelectSave = ({ saves, onSelectSlot, onDeleteSlot }: SelectSaveProps) => {
  return (
    <Screen>
      <Text style={styles.title}>CHOOSE SAVE SLOT</Text>
      {[1, 2, 3].map((slotId) => {
        const saveData = saves[slotId - 1];
        return (
          <View key={slotId} style={styles.slotWrapper}>
            <TouchableOpacity 
              style={styles.slotCard} 
              onPress={() => onSelectSlot(slotId)}
            >
              <View>
                <Text style={styles.slotNumber}>SAVE {slotId}</Text>
                {saveData ? (
                  <Text style={styles.saveInfo}>{saveData.city}</Text>
                ) : (
                  <Text style={styles.emptyText}>[ EMPTY SLOT ]</Text>
                )}
              </View>
              {saveData && (
                <View>
                  <Text style={styles.saveStats}>{saveData.wins}-{saveData.losses}</Text>
                  <Text style={styles.saveYear}>S{saveData.seasonCount} Y{saveData.currentYear}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {saveData && (
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => onDeleteSlot(slotId)}
              >
                <Text style={styles.deleteText}>RESET</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 40, letterSpacing: 2 },
  slotWrapper: { marginBottom: 20 },
  slotCard: { 
    borderWidth: 2, borderColor: '#EEE', padding: 25, borderRadius: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF'
  },
  slotNumber: { fontWeight: 'bold', color: '#888', fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  saveInfo: { fontSize: 18, fontWeight: '900', color: '#000' },
  saveStats: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', textAlign: 'right' },
  saveYear: { fontSize: 11, color: '#A0AEC0', textAlign: 'right', marginTop: 2 },
  emptyText: { color: '#CCC', fontStyle: 'italic', fontSize: 16 },
  deleteBtn: { position: 'absolute', top: -10, right: 10, backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#FED7D7' },
  deleteText: { color: '#E53E3E', fontSize: 9, fontWeight: '900' }
});

export default SelectSave;