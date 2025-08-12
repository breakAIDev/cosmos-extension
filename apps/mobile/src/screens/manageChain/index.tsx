import React, { useState } from 'react';
import { View, Image, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { MinusCircle } from 'phosphor-react-native'; // This works on RN too
import DraggableContainer from '../../components/draggable'; // Updated to RN version above
import { ManageChainDraggables, ManageChainNonDraggables } from '../../components/draggable/manage-chains';
import PopupLayout from '../../components/layout/popup-layout';
import NoSearchResults from '../../components/no-search-results';
import { BETA_CHAINS } from '../../services/config/storage-keys';
import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import useActiveWallet, { useUpdateKeyStore } from '../../hooks/settings/useActiveWallet';
import { useChainInfos, useSetChainInfos } from '../../hooks/useChainInfos';
import { Images } from '../../../assets/images';
import { deleteChainStore } from '../../context/delete-chain-store';
import { ManageChainSettings, manageChainsStore } from '../../context/manage-chains-store';
import { Colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storage
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Key } from '@leapwallet/cosmos-wallet-hooks';
import BottomModal from '../../components/bottom-modal';
import Text from '../../components/text';
import { Button } from '../../components/ui/button';
import { HeaderActionType } from '../../types/components';
import { Header } from '@leapwallet/leap-ui';


// Helper for reordering
const reorder = (list: ManageChainSettings[], startIndex: number, endIndex: number): ManageChainSettings[] => {
  const result: ManageChainSettings[] = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const RemoveChain = observer(({ defaultChain }: { defaultChain: SupportedChain }) => {
  const setActiveChain = useSetActiveChain();
  const setChainInfos = useSetChainInfos();
  const chainInfos = useChainInfos();

  const { activeWallet, setActiveWallet } = useActiveWallet();

  const updateKeyStore = useUpdateKeyStore();

  const handleRemove = async () => {
    const resp = await AsyncStorage.getItem(BETA_CHAINS);
    const _betaChains = resp ? JSON.parse(resp) : {};
    delete _betaChains[deleteChainStore.chainInfo?.chainName as string];
    await AsyncStorage.setItem(BETA_CHAINS, JSON.stringify(_betaChains));

    const _newChains = { ...chainInfos };
    delete _newChains[deleteChainStore.chainInfo?.chainName as keyof typeof _newChains];
    setChainInfos(_newChains);

    const updatedKeystore = await updateKeyStore(
      activeWallet as Key,
      deleteChainStore.chainInfo?.chainName as unknown as SupportedChain,
      'DELETE'
    );
    await setActiveWallet(updatedKeystore[activeWallet?.id as string] as Key);
    setActiveChain(defaultChain);
    deleteChainStore.setChainInfo(null);
  };

  return (
    <BottomModal
      isOpen={!!deleteChainStore.chainInfo}
      onClose={() => deleteChainStore.setChainInfo(null)}
      title={'Remove Chain?'}
    >
      <View style={{ alignItems: 'center', padding: 16 }}>
        <View style={{
          borderRadius: 24, backgroundColor: Colors.white100, padding: 12, width: 48, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16
        }}>
          <MinusCircle size={24} color={Colors.red300} />
        </View>
        <Text style={{ color: Colors.gray800, fontWeight: '500', fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
          Are you sure you want to remove {deleteChainStore.chainInfo?.chainName as string}?
        </Text>
        <Button
          style={{ height: 48, backgroundColor: Colors.gray900, width: '100%', marginBottom: 12 }}
          onPress={handleRemove}
        >
          Remove
        </Button>
        <Button
          style={{ height: 48, backgroundColor: Colors.cosmosPrimary, width: '100%' }}
          onPress={() => deleteChainStore.setChainInfo(null)}
        >
          Don’t Remove
        </Button>
      </View>
    </BottomModal>
  );
});

const ManageChain = observer(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const _chains = manageChainsStore.chains.filter((chain) => !chain.beta);
  const _betaChains = manageChainsStore.chains.filter((chain) => chain.beta);
  const _filteredBetaChains = _betaChains.filter((chain) =>
    chain.chainName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For DraggableFlatList, data and renderItem are required
  const renderChainItem = ({ item, drag, isActive }: any) => (
    // Assuming ManageChainDraggables is adjusted for RN, or inline render here
    <ManageChainDraggables
      chains={item}
      drag={drag}
      isActive={isActive}
      updateChainFunction={(chain: any) => manageChainsStore.toggleChain(chain)}
    />
  );

  const onDragEnd = ({ data }: { data: ManageChainSettings[] }) => {
    manageChainsStore.updatePreferenceOrder(data);
  };

  return (
    <View style={{ flex: 1 }}>
      <PopupLayout
        header={
          <Header
            title={'Manage chains'}
            action={{
              onClick: () => navigation.goBack(),
              type: HeaderActionType.BACK,
            }}
          />
        }
      >
        <View style={{ paddingTop: 28 }}>
          <View style={{
            marginHorizontal: 'auto',
            width: 344,
            flexDirection: 'row',
            height: 40,
            backgroundColor: Colors.white100,
            borderRadius: 30,
            alignItems: 'center',
            paddingHorizontal: 16
          }}>
            <TextInput
              placeholder='search chains...'
              style={{
                flex: 1,
                fontSize: 16,
                color: Colors.gray400,
                backgroundColor: Colors.white100,
                padding: 0,
                margin: 0,
              }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length === 0 ? (
              <Image source={{uri: Images.Misc.Search}} width={24} height={24} />
            ) : (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Image source={{uri: Images.Misc.CrossFilled}} width={24} height={24} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
            <DraggableContainer
              data={_chains.filter((chain) => chain.chainName.toLowerCase().includes(searchQuery.toLowerCase()))}
              renderItem={renderChainItem}
              keyExtractor={(item, index) => `${item.chainName}_${index}`}
              onDragEnd={onDragEnd}
            />
            {searchQuery.length > 0 &&
              _chains.filter((chain) => chain.chainName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
              <NoSearchResults searchQuery={searchQuery} />
            }
            {_filteredBetaChains.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                <ManageChainNonDraggables
                  chains={_filteredBetaChains}
                  searchQuery={searchQuery}
                  updateChainFunction={(chain: any) => manageChainsStore.toggleChain(chain)}
                  title='Recently added (Beta)'
                />
              </View>
            ) : null}
          </View>
        </View>
      </PopupLayout>
      <RemoveChain defaultChain={manageChainsStore.chains[0].chainName} />
    </View>
  );
});

export default ManageChain;
