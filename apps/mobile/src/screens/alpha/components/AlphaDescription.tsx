import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Separator } from '../../../components/ui/separator';
import { EventName, PageName } from '../../../services/config/analytics';
import mixpanel from '../../../mixpanel'; // or your RN mixpanel wrapper
import { getHostname } from '../utils';
import { RaffleListingProps } from '../chad-components/RaffleListing';
import { AlphaOpportunityProps } from './AlphaOpportunity';

/**
 * Description for Alpha listing (markdown)
 */
export default function AlphaDescription(opportunity: AlphaOpportunityProps) {
  if (!opportunity.descriptionActions) return null;

  return (
    <View style={styles.markdownContainer}>
      <Markdown
        style={markdownStyles}
        onLinkPress={url => {
          // Optional: Analytics
          // mixpanel.track(EventName.PageView, { ... });
          return true;
        }}
        rules={{
          hr: (node, children, parent, styles) => (
            <Separator key={node.key} style={{ marginVertical: 20 }} />
          ),
        }}
      >
        {opportunity.descriptionActions}
      </Markdown>
    </View>
  );
}

/**
 * Description for Chad listing (markdown)
 */
export function ChadDescription(raffle: RaffleListingProps) {
  if (!raffle.description) return null;

  return (
    <View style={styles.markdownSection}>
      <Text style={styles.aboutTitle}>About</Text>
      <Markdown
        style={markdownStyles}
        onLinkPress={url => {
          try {
            mixpanel.track(EventName.PageView, {
              pageName: PageName.ChadExclusivesDetail,
              name: raffle.title,
              id: raffle.id,
              raffleExternalURL: getHostname(url ?? ''),
              ecosystem: [...(raffle?.categories ?? [])],
              categories: [...(raffle?.ecosystem ?? [])],
              isChad: true,
            });
          } catch (err) {}
          return true;
        }}
      >
        {raffle.description}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  markdownContainer: {
    borderRadius: 16,
    backgroundColor: '#fafafc',
    padding: 16,
    marginVertical: 6,
  },
  markdownSection: {
    borderRadius: 16,
    backgroundColor: '#fafafc',
    padding: 16,
    marginVertical: 6,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
});

const markdownStyles = {
  body: {
    color: '#222',
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  link: {
    color: '#16a34a',
    textDecorationLine: 'underline' as TextStyle['textDecorationLine'],
  },
};
