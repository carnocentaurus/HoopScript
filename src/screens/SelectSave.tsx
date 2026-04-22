import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { useSound } from '../hooks/useSound';

interface SelectSaveProps {
  saves: (GameSave | null)[];
  onSelectSlot: (slotId: number) => void;
  onDeleteSlot: (slotId: number) => void;
}

const SelectSave = ({ saves, onSelectSlot, onDeleteSlot }: SelectSaveProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <Screen style={globalStyles.selectSaveContainer}>
      {[1, 2, 3].map((slotId) => {
        const saveData = saves[slotId - 1];
        return (
          <View key={slotId} style={globalStyles.selectSaveSlotWrapper}>
            <TouchableOpacity 
              style={globalStyles.selectSaveSlotCard} 
              onPress={() => handlePress(() => onSelectSlot(slotId))}
            >
              <View>
                {!saveData && (
                  <Text style={globalStyles.selectSaveSlotNumber}>SAVE {slotId}</Text>
                )}
                {saveData && (
                  <Text style={globalStyles.selectSaveInfo}>{saveData.city}</Text>
                )}
              </View>
              {saveData && (
                <View>
                  <Text style={globalStyles.selectSaveStats}>{saveData.wins}-{saveData.losses}</Text>
                  <Text style={globalStyles.selectSaveYear}>S{saveData.seasonCount} Y{saveData.currentYear}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {saveData && (
              <TouchableOpacity 
                style={globalStyles.selectSaveDeleteBtn} 
                onPress={() => handlePress(() => onDeleteSlot(slotId))}
              >
                <Text style={globalStyles.selectSaveDeleteText}>RESET</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </Screen>
  );
};

export default SelectSave;