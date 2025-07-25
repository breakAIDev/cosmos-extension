import { Check } from '@phosphor-icons/react';
import classNames from 'classnames';
import React from 'react';

import { Colors } from '../../theme/colors';

type Props = {
  
  selectColorIndex: (index: number) => void;
  colorIndex: number;
};

export default function SelectWalletColors({ selectColorIndex, colorIndex }: Props) {
  return (
    <div className='flex items-center gap-x-[8px] justify-center'>
      {Colors.walletColors.map((color, index) => {
        return (
          <div
            key={index}
            onClick={() => {
              selectColorIndex(index);
            }}
            className={classNames('p-[4px] rounded-full cursor-pointer', {
              'border-2': colorIndex === index,
            })}
            style={{ borderColor: color }}
          >
            <div
              className={classNames('flex items-center justify-center rounded-full w-[16px] h-[16px]')}
              style={{ backgroundColor: color }}
            >
              {index === colorIndex && <Check size={12} className='text-white-100' />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
