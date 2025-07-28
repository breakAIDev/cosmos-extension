import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useWhitelistedUrls } from '@leapwallet/cosmos-wallet-hooks';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import RedirectionConfirmationModal from '../redirect-confirmation';

type ProposalDescriptionProps = {
  title: string;
  description: string;
  btnColor: string;
  style?: object;
  forceChain?: string;
};

export function ProposalDescription({
  title,
  description,
  btnColor,
  style,
  forceChain,
}: ProposalDescriptionProps) {
  const [showAll, setShowAll] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [showRedirectConfirmation, setShowRedirectConfirmation] = useState(false);

  const formattedDescription = useMemo(() => {
    return description.replace(/\/n/g, '\n').split(/\\n/).join('\n');
  }, [description]);

  const { data: allWhitelistedUrls } = useWhitelistedUrls();
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;

  const whiteListedUrls = useMemo(() => {
    if (!allWhitelistedUrls) return [];
    return [...(allWhitelistedUrls[activeChain] ?? []), ...(allWhitelistedUrls['all_chains'] ?? [])];
  }, [allWhitelistedUrls, activeChain]);

  const isAllowedUrl = useCallback(
    (url: string) => whiteListedUrls.some((allowedUrl) => url.includes(allowedUrl)),
    [whiteListedUrls]
  );

  const handleLinkPress = useCallback(
    (href: string) => {
      if (isAllowedUrl(href)) {
        Linking.openURL(href);
      } else {
        setUrl(href);
        setShowRedirectConfirmation(true);
      }
    },
    [isAllowedUrl]
  );

  if (!formattedDescription) return null;

  const shortText = formattedDescription.length > 300 && !showAll
    ? formattedDescription.slice(0, 300) + '...'
    : formattedDescription;

  return (
    <View style={style}>
      <Text style={styles.title}>{title}</Text>

      <Markdown
        style={markdownStyles}
        onLinkPress={handleLinkPress}
      >
        {shortText}
      </Markdown>

      {formattedDescription.length > 300 && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)}>
          <Text style={[styles.toggle, { color: btnColor }]}>
            {showAll ? 'Read less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )}

      <RedirectionConfirmationModal
        isOpen={showRedirectConfirmation}
        onClose={() => setShowRedirectConfirmation(false)}
        url={url}
        setUrl={setUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    color: '#6b7280', // Tailwind text-muted-foreground
    fontWeight: '500',
    marginBottom: 8,
  },
  toggle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 4,
  },
});

const markdownStyles = {
  body: { color: '#111827', fontSize: 14 },
  heading1: { fontSize: 16, fontWeight: 'bold' },
  heading2: { fontSize: 15, marginVertical: 4, color: '#9ca3af' },
  link: { color: '#2563eb' },
};
