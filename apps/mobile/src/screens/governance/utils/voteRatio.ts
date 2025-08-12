import { ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { VoteOptions } from '../components/CastVoteSheet';

type TallyResult = {
  yes: string;
  abstain: string;
  no: string;
  no_with_veto?: string;
};

type VoteSectionValues = {
  label: VoteOptions;
  percentage: number;
  selectedBorderStyle: StyleProp<ViewStyle>;
  selectedBackgroundStyle: StyleProp<ViewStyle>;
  isMajor: boolean;
};

// Note: Use borderColor and backgroundColor
const borderStyle = StyleSheet.create({
  [VoteOptions.YES]: { borderColor: '#29A874' },
  [VoteOptions.ABSTAIN]: { borderColor: '#D1A700' },
  [VoteOptions.NO]: { borderColor: '#FF707E' }, // or '#C53030'
  [VoteOptions.NO_WITH_VETO]: { borderColor: '#FF707E' },
  GENERAL: { borderColor: '#E0E0E0' },
});

const backgroundStyle = StyleSheet.create({
  [VoteOptions.YES]: { backgroundColor: 'rgba(41,168,116,0.16)' },
  [VoteOptions.ABSTAIN]: { backgroundColor: '#F4E57A' },
  [VoteOptions.NO]: { backgroundColor: 'rgba(255,112,126,0.14)' }, // or 'rgba(197,48,48,0.10)'
  [VoteOptions.NO_WITH_VETO]: { backgroundColor: 'rgba(255,112,126,0.14)' },
  GENERAL: { backgroundColor: '#F2F2F2' },
});

export function voteRatio(tally: TallyResult): VoteSectionValues[] {
  const yes = Number(tally.yes);
  const no = Number(tally.no);
  const noWithVeto = Number(tally.no_with_veto ?? 0);
  const abstain = Number(tally.abstain);

  const total = Math.max(yes + no + abstain + noWithVeto, 1);

  const yesPercentage = (yes / total) * 100;
  const noPercentage = (no / total) * 100;
  const noWithVetoPercentage = (noWithVeto / total) * 100;
  const abstainPercentage = (abstain / total) * 100;
  const maxPercentage = Math.max(yesPercentage, noPercentage, noWithVetoPercentage, abstainPercentage, 1);

  return [
    {
      label: VoteOptions.YES,
      percentage: yesPercentage,
      selectedBorderStyle: yesPercentage === maxPercentage ? borderStyle[VoteOptions.YES] : borderStyle.GENERAL,
      selectedBackgroundStyle: yesPercentage === maxPercentage ? backgroundStyle[VoteOptions.YES] : backgroundStyle.GENERAL,
      isMajor: yesPercentage === maxPercentage,
    },
    {
      label: VoteOptions.NO,
      percentage: noPercentage,
      selectedBorderStyle: noPercentage === maxPercentage ? borderStyle[VoteOptions.NO] : borderStyle.GENERAL,
      selectedBackgroundStyle: noPercentage === maxPercentage ? backgroundStyle[VoteOptions.NO] : backgroundStyle.GENERAL,
      isMajor: noPercentage === maxPercentage,
    },
    {
      label: VoteOptions.NO_WITH_VETO,
      percentage: noWithVetoPercentage,
      selectedBorderStyle:
        noWithVetoPercentage === maxPercentage ? borderStyle[VoteOptions.NO_WITH_VETO] : borderStyle.GENERAL,
      selectedBackgroundStyle:
        noWithVetoPercentage === maxPercentage ? backgroundStyle[VoteOptions.NO_WITH_VETO] : backgroundStyle.GENERAL,
      isMajor: noWithVetoPercentage === maxPercentage,
    },
    {
      label: VoteOptions.ABSTAIN,
      percentage: abstainPercentage,
      selectedBorderStyle: abstainPercentage === maxPercentage ? borderStyle[VoteOptions.ABSTAIN] : borderStyle.GENERAL,
      selectedBackgroundStyle:
        abstainPercentage === maxPercentage ? backgroundStyle[VoteOptions.ABSTAIN] : backgroundStyle.GENERAL,
      isMajor: abstainPercentage === maxPercentage,
    },
  ];
}
