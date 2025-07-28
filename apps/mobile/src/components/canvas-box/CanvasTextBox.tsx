import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import Canvas from 'react-native-canvas';
import { useTheme, ThemeName } from '@leapwallet/leap-ui';
import { Images } from '../../../assets/images';

type CanvasTextBoxProps = {
  text: string;
  size?: 'lg' | 'md' | 'sm';
  noSpace?: boolean;
};

type CanvasBoxProps = {
  text: string;
  width: number;
  height: number;
  noSpace?: boolean;
};

const widthMap = {
  lg: 376,
  md: 344,
  sm: 304,
};
const heightMap = {
  normal: 144,
  full: 288,
};

function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function CanvasBox({ text, width, height, noSpace }: CanvasBoxProps) {
  const { theme } = useTheme();
  const canvasRef = useRef(null);

  const handleCanvas = async (canvas) => {
    if (!canvas) return;
    // fix for Android sizing
    if (Platform.OS === 'android') {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = await canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme === ThemeName.DARK;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = isDark ? '#2121210d' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    let xPos = 24, yPos = 0;
    let x = xPos, y = yPos;

    if (noSpace) {
      // Private key: display as a string
      const numberOfWords = Math.floor((width - 35) / 7);
      const chars = text.split('');
      const lines = [];
      let currentStr = '';
      chars.forEach((char, idx) => {
        currentStr += char;
        if ((idx + 1) % numberOfWords === 0) {
          lines.push(currentStr);
          currentStr = '';
        }
      });
      if (currentStr.length > 0) lines.push(currentStr);

      xPos = 10; yPos = 20;
      lines.forEach((r) => {
        ctx.font = 'bold 13px Arial';
        ctx.fillStyle = isDark ? '#fff' : '#383838';
        ctx.fillText(r, xPos, yPos);
        yPos += 20;
      });
    } else {
      // Mnemonic phrase: display in bubbles with indices
      const splittedText = text.split(' ');
      const yLength = splittedText.length === 24 ? 8 : 4;

      splittedText.forEach((word, idx) => {
        if (idx > 0 && idx % 3 === 0) {
          x = xPos;
          y += height / yLength;
        }
        const rectH = 26;
        const rectW = 80;
        const rectR = 13;
        roundRect(ctx, x, y, rectW, rectH, rectR);

        ctx.font = '500 12px Arial';
        ctx.textAlign = 'start';
        ctx.fillStyle = '#9e9e9e';
        ctx.fillText(`${idx + 1}`, x - 8, y + rectH / 2 + 5);

        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'start';
        ctx.fillStyle = isDark ? '#fff' : '#383838';
        ctx.fillText(`${word}`, x + 16, y + rectH / 2 + 5);
        x += width / 3;
      });
    }
  };

  return (
    <Canvas
      ref={canvasRef}
      style={{ width, height, borderRadius: 16, backgroundColor: 'transparent' }}
      onCanvasReady={handleCanvas}
    />
  );
}

export default function CanvasTextBox({ text, noSpace, size = 'lg' }: CanvasTextBoxProps) {
  const textLength = (text ?? '').split(' ').length;
  const canvasWidth = widthMap[size] - 30;
  const canvasHeight = textLength === 24 ? heightMap.full : heightMap.normal;
  const boxHeight = textLength === 24 ? 184 + 144 : 184;

  return (
    <View style={[
      styles.container,
      { height: boxHeight, width: widthMap[size] },
      textLength === 24 ? { height: 328 } : { height: 184 },
    ]}>
      <View style={styles.centerContent}>
        <CanvasBox
          height={canvasHeight}
          width={canvasWidth}
          text={text}
          noSpace={noSpace}
        />
      </View>
      <View style={styles.cover}>
        <View style={styles.coverContent}>
          <Image
            source={Images.Misc.VisibilityOffIcon}
            style={styles.visibilityIcon}
            resizeMode="contain"
          />
          {/* Optionally, add accessibility for screen readers */}
          <Text style={styles.srOnly}>Tap to view the phrase</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    backgroundColor: '#F5F7FB',
    position: 'relative',
    opacity: 0.8,
    overflow: 'hidden',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(250,250,250,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityIcon: {
    width: 48,
    height: 48,
    tintColor: '#222', // adjust for theme
    marginBottom: 8,
  },
  srOnly: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
});
