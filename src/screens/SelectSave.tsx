import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameSave } from '../types/save';
import Screen from '../components/Screen';
import { globalStyles } from '../styles/globalStyles';
import { useSound } from '../hooks/useSound';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

interface SelectSaveProps {
  saves: (GameSave | null)[];
  onSelectSlot: (slotId: number) => void;
  onDeleteSlot: (slotId: number) => void;
  onViewCredits: () => void;
}

const SelectSave = ({ saves, onSelectSlot, onDeleteSlot, onViewCredits }: SelectSaveProps) => {
  const { playClickSound } = useSound();

  const handlePress = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <Screen>
      <View style={[globalStyles.homeSeasonHeader, { justifyContent: 'flex-end' }]}>
        <TouchableOpacity 
          onPress={() => handlePress(onViewCredits)}
        >
          <Icon name="information-outline" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={globalStyles.selectSaveContainer}>
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
      </View>
    </Screen>
  );
};

export default SelectSave;