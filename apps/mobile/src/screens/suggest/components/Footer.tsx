import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ErrorCard } from '../../../components/ErrorCard';
import { LoaderAnimation } from '../../../components/loader/Loader';

type FooterProps = {
  children: ReactNode;
  error?: string;
  isFetching?: boolean;
};

export function Footer({ children, error, isFetching }: FooterProps) {
  return (
    <View style={[styles.container, isFetching ? styles.center : styles.end]}>
      {error ? (
        <View style={styles.errorWrap}>
          <ErrorCard text={error} />
        </View>
      ) : null}

      {!isFetching ? children : <LoaderAnimation color="#E18881" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    // box-sizing doesn't exist in RN; omitted by design.
  },
  center: {
    justifyContent: 'center',
  },
  end: {
    justifyContent: 'flex-end',
  },
  errorWrap: {
    marginVertical: 8, // Tailwind 'my-2'
  },
});
