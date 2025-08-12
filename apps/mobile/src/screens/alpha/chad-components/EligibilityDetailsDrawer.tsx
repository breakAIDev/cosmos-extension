import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useAddress } from '@leapwallet/cosmos-wallet-hooks';
import { CheckCircle } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal'; // This is the file above
import { Button } from '../../../components/ui/button'; // This should be your RN Button abstraction
import { Drawer, DrawerContent } from '../../../components/ui/drawer';
import { useAlphaUser } from '../../../hooks/useAlphaUser';
import { useQueryParams } from '../../../hooks/useQuery';
import { CrownFrog, HappyFrog } from '../../../../assets/icons/frog'; // Use your RN svg or PNGs
import { Images } from '../../../../assets/images'; // Make sure this resolves to RN image
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { queryParams } from '../../../utils/query-params';

type EligibilityDrawerProps = {
  isShown: boolean;
  onClose: () => void;
};

const eligibilitySteps = [
  'Make transactions with Leap Wallet',
  'Use core features like Swap and Stake',
  'Stay active in the Leap ecosystem',
];

function NonChadDetailsDrawer({ isShown, onClose }: EligibilityDrawerProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title="How to Become a Leap Chad?"
      hideActionButton={true}
      style={[styles.centeredCol, styles.mb4]}
    >
      <View style={styles.centeredCol}>
        <View style={styles.iconCircle}>
          <HappyFrog width={64} height={64} />
        </View>

        <View style={[styles.centeredCol, styles.mt2, styles.mb7]}>
          <Text style={styles.heading}>How to Become a Leap Chad?</Text>
          <Text style={styles.subheading}>
            NFT WL Giveaways, Early access & Invite Codes, Dapp Quests, Points, Airdrops and more are waiting. You can qualify for Leap Chad by:
          </Text>
        </View>

        <View style={styles.stepsList}>
          {eligibilitySteps.map((step) => (
            <View key={step} style={styles.stepItem}>
              <Text style={{ marginRight: 8 }}>
                <CheckCircle size={24} color="#2563eb" />
              </Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <Button
          style={[styles.actionBtn, { marginTop: 'auto' }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.actionBtnText}>Explore Leap Features</Text>
        </Button>
        <Text style={styles.notice}>
          We'll notify you when you become a Leap Chad!
        </Text>
      </View>
    </BottomModal>
  );
}

function ChadDetailsDrawer({ isShown, onClose }: EligibilityDrawerProps) {
  const navigation = useNavigation();

  return (
    <Drawer open={isShown} onClose={onClose}>
      <DrawerContent showHandle={false}>
        <ScrollView contentContainerStyle={[styles.centeredCol, {margin: 'auto'}, styles.mb7]}>
          <View style={styles.bannerContainer}>
            <Image
              source={{uri: Images.Alpha.chadDefaultBanner}}
              style={styles.bannerImg}
              resizeMode="cover"
            />
            <CrownFrog style={{ margninVertical: 24 }} />
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={styles.chadCongrats}>Congratulations!{'\n'}You are now a Leap Chad</Text>
              <Text style={styles.chadText}>
                You now have access to exclusive whitelisted giveaways, airdrops and more!
              </Text>
            </View>
            <Button
              style={[styles.actionBtn, { width: '100%' }]}
              onPress={() => {
                onClose();
                navigation.navigate('Alpha', {tab: 'exclusive'});
              }}
            >
              <Text style={styles.actionBtnText}>View exclusive rewards</Text>
            </Button>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.dismissBtn}>Dismiss</Text>
          </TouchableOpacity>
        </ScrollView>
      </DrawerContent>
    </Drawer>
  );
}

// Your wrapper should pass isChad, isShown, onClose props from parent screen
export const EligibleDetailsDrawer = () => {
  const cosmosAddress = useAddress('cosmos');
  const { alphaUser } = useAlphaUser(cosmosAddress);
  const params = useQueryParams();

  const show = params.get(queryParams.chadEligibility) === 'true';

  const hide = () => params.remove(queryParams.chadEligibility);

  return alphaUser?.isChad ? (
    <ChadDetailsDrawer isShown={show} onClose={hide} />
  ) : (
    <NonChadDetailsDrawer isShown={show} onClose={hide} />
  );
};

const styles = StyleSheet.create({
  mb4: {marginBottom: 16,},
  mb7: {marginBottom: 27,},
  mt2: {marginTop: 8,},
  centeredCol: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
  },
  stepsList: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginVertical: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 15,
    color: '#222',
  },
  actionBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginVertical: 18,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notice: {
    fontSize: 13,
    color: '#949AB0',
    textAlign: 'center',
    marginTop: 12,
  },
  bannerContainer: {
    width: 340,
    minHeight: 440,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    marginVertical: 30,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  bannerImg: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 24,
    zIndex: -1,
  },
  chadCongrats: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
    color: '#2563eb',
  },
  chadText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#222',
    marginBottom: 16,
  },
  dismissBtn: {
    marginTop: 20,
    color: '#8c8c8c',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
});
