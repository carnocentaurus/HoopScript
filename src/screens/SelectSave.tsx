import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';

interface SelectSaveProps {
  saves: (GameSave | null)[];
  onSelectSlot: (slotId: number) => void;
  onDeleteSlot: (slotId: number) => void;
}

const SelectSave = ({ saves, onSelectSlot, onDeleteSlot }: SelectSaveProps) => {
  return (
    <Screen>
      <Text style={globalStyles.selectSaveTitle}>CHOOSE SAVE SLOT</Text>
      {[1, 2, 3].map((slotId) => {
        const saveData = saves[slotId - 1];
        return (
          <View key={slotId} style={globalStyles.selectSaveSlotWrapper}>
            <TouchableOpacity 
              style={globalStyles.selectSaveSlotCard} 
              onPress={() => onSelectSlot(slotId)}
            >
              <View>
                <Text style={globalStyles.selectSaveSlotNumber}>SAVE {slotId}</Text>
                {saveData ? (
                  <Text style={globalStyles.selectSaveInfo}>{saveData.city}</Text>
                ) : (
                  <Text style={globalStyles.selectSaveEmptyText}>[ EMPTY SLOT ]</Text>
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
                onPress={() => onDeleteSlot(slotId)}
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