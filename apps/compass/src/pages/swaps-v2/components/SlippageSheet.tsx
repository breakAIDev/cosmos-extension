import classNames from 'classnames';
import BottomModal from 'components/bottom-modal';
import Text from 'components/text';
import { Button } from 'components/ui/button';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSwapContext } from '../context';
import { getSlippageRemarks, SlippageRemarks } from '../utils/slippage';

interface SlippageSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSlippageInfoClick: () => void;
}
const SLIPPAGE_OPTIONS: (number | string)[] = [0.5, 1, 3, 'custom'] as const;

export function SlippageSheet({ isOpen, onClose, onSlippageInfoClick }: SlippageSheetProps) {
  const { slippagePercent, setSlippagePercent } = useSwapContext();
  const [selectedSlippageOption, setSelectedSlippageOption] = useState(
    SLIPPAGE_OPTIONS.includes(slippagePercent) ? slippagePercent : 'custom',
  );
  const [customSlippage, setCustomSlippage] = useState<string>('');
  const [slippageRemarks, setSlippageRemarks] = useState<SlippageRemarks>();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSlippageOption(SLIPPAGE_OPTIONS.includes(slippagePercent) ? slippagePercent : 'custom');
      if (!SLIPPAGE_OPTIONS.includes(slippagePercent)) {
        inputRef.current?.focus();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (showCustomInput) {
      inputRef.current?.focus();
    }
  }, [showCustomInput]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (event.target && 'id' in event.target && event.target.id !== 'customBtn') {
      setShowCustomInput(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    setSlippageRemarks(getSlippageRemarks(customSlippage));
  }, [customSlippage]);

  const handleOnProceedClick = useCallback(() => {
    if (selectedSlippageOption !== 'custom') {
      setSlippagePercent(selectedSlippageOption as number);
    } else {
      setSlippagePercent(parseFloat(customSlippage));
    }
    onClose();
  }, [customSlippage, onClose, selectedSlippageOption, setSlippagePercent]);

  const proceedDisabled = useMemo(() => {
    if (typeof selectedSlippageOption === 'string') {
      if (slippageRemarks?.type === 'error') return true;
      if (!customSlippage) return true;
    }
    return false;
  }, [customSlippage, selectedSlippageOption, slippageRemarks?.type]);

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={'Max. Slippage'} containerClassName='bg-secondary-50'>
      <div className='flex flex-col gap-7 w-full p-2 !pt-6'>
        {/* <div className='flex flex-col gap-2 justify-start items-start w-full p-2 rounded-2xl hide-scrollbar overflow-scroll'> */}
        <div className='flex flex-row w-full justify-between items-center rounded-'>
          {SLIPPAGE_OPTIONS.map((option) =>
            option === 'custom' && showCustomInput ? (
              <input
                type='number'
                value={customSlippage}
                onChange={(e) => {
                  setCustomSlippage(e.target.value);
                }}
                ref={inputRef}
                className='w-[88px] h-[48px] rounded-lg font-bold text-[18px] !leading-[24.3px] text-black-100 dark:text-white-100 bg-transparent outline-none focus:border focus:border-white text-center'
              />
            ) : (
              <button
                key={option}
                id={option === 'custom' ? 'customBtn' : undefined}
                onClick={() => {
                  setSelectedSlippageOption(option);
                  if (customSlippage) {
                    setCustomSlippage('');
                  }
                  if (option === 'custom') {
                    setShowCustomInput(true);
                  } else {
                    setShowCustomInput(false);
                  }
                }}
                className={classNames('text-[18px] h-[48px] rounded-lg !leading-[24.3px] px-2.5 py-3 w-full', {
                  'dark:text-white-100 text-black-100 font-bold bg-gray-50 dark:bg-gray-900':
                    selectedSlippageOption === option,
                  'dark:text-gray-400 text-gray-600 font-medium': selectedSlippageOption !== option,
                })}
              >
                {option === 'custom' ? (customSlippage ? `${customSlippage}%` : 'Custom') : `${option}%`}
              </button>
            ),
          )}
        </div>
        {/* {selectedSlippageOption === 'custom' && (
            <div
              className={classNames(
                'flex w-full py-2 h-[48px] pl-3 pr-4 flex-row rounded-2xl justify-between gap-4 bg-gray-50 dark:bg-gray-900 items-center relative border border-transparent',
                {
                  'focus-within:border-green-600': !slippageRemarks,
                  'focus-within:border-orange-500 dark:focus-within:border-orange-300':
                    slippageRemarks?.color === 'orange',
                  'focus-within:border-red-400 dark:focus-within:border-red-300':
                    slippageRemarks?.color === 'red',
                },
              )}
            >
              <div className='shrink-0 font-medium text-sm !leading-[22.5px] text-gray-600 dark:text-gray-400'>
                Amount
              </div>
              <div className='flex flex-row justify-end items-center w-full'>
                <input
                  type='number'
                  value={customSlippage}
                  placeholder='0'
                  onChange={(e) => {
                    setCustomSlippage(e.target.value)
                  }}
                  ref={inputRef}
                  className='w-full font-bold text-[18px] !leading-[24.3px] text-black-100 placeholder:text-gray-600 placeholder:dark:text-gray-400 dark:text-white-100 bg-transparent outline-none text-right'
                />
                <div
                  className={classNames('shrink-0 font-bold text-[18px] !leading-[24.3px] ', {
                    'text-gray-600 dark:text-gray-400': customSlippage === '',
                    'text-black-100 dark:text-white-100': customSlippage !== '',
                  })}
                >
                  %
                </div>
              </div>
            </div>
          )} */}
        {/* </div> */}
        {/* <div className='flex flex-col gap-4 p-4 dark:bg-gray-900 bg-gray-50 rounded-2xl w-full'>
          <span className='dark:text-white-100 text-sm !leading-[19.6px] font-bold text-black-100'>
            Select a slippage value
          </span>
          <div className='flex flex-col gap-2 justify-start items-start w-full p-2 bg-gray-100 dark:bg-gray-850 rounded-2xl hide-scrollbar overflow-scroll'>
            <div className='flex flex-row w-full justify-between items-center'>
              {SLIPPAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedSlippageOption(option)
                  }}
                  className={classNames(
                    'text-sm h-[32px] rounded-full !leading-[19.6px] px-[16px] w-full',
                    {
                      'dark:text-white-100 text-black-100 font-bold bg-gray-50 dark:bg-gray-900':
                        selectedSlippageOption === option,
                      'dark:text-gray-400 text-gray-600 font-medium':
                        selectedSlippageOption !== option,
                    },
                  )}
                >
                  {option === 'custom' ? 'Custom' : `${option}%`}
                </button>
              ))}
            </div>
            {selectedSlippageOption === 'custom' && (
              <div
                className={classNames(
                  'flex w-full py-2 h-[48px] pl-3 pr-4 flex-row rounded-2xl justify-between gap-4 bg-gray-50 dark:bg-gray-900 items-center relative border border-transparent',
                  {
                    'focus-within:border-green-600': !slippageRemarks,
                    'focus-within:border-orange-500 dark:focus-within:border-orange-300':
                      slippageRemarks?.color === 'orange',
                    'focus-within:border-red-400 dark:focus-within:border-red-300':
                      slippageRemarks?.color === 'red',
                  },
                )}
              >
                <div className='shrink-0 font-medium text-sm !leading-[22.5px] text-gray-600 dark:text-gray-400'>
                  Amount
                </div>
                <div className='flex flex-row justify-end items-center w-full'>
                  <input
                    type='number'
                    value={customSlippage}
                    placeholder='0'
                    onChange={(e) => {
                      setCustomSlippage(e.target.value)
                    }}
                    ref={inputRef}
                    className='w-full font-bold text-[18px] !leading-[24.3px] text-black-100 placeholder:text-gray-600 placeholder:dark:text-gray-400 dark:text-white-100 bg-transparent outline-none text-right'
                  />
                  <div
                    className={classNames('shrink-0 font-bold text-[18px] !leading-[24.3px] ', {
                      'text-gray-600 dark:text-gray-400': customSlippage === '',
                      'text-black-100 dark:text-white-100': customSlippage !== '',
                    })}
                  >
                    %
                  </div>
                </div>
              </div>
            )}
          </div>
          {slippageRemarks && (
            <div className='flex flex-row w-full justify-start items-start gap-2'>
              <Warning
                size={16}
                className={classNames('!leading-[16px]', {
                  'text-orange-500 dark:text-orange-300': slippageRemarks.color === 'orange',
                  'text-red-400 dark:text-red-300': slippageRemarks.color === 'red',
                })}
              />
              <span
                className={classNames('font-medium text-xs !leading-[19.2px]', {
                  'text-orange-500 dark:text-orange-300': slippageRemarks.color === 'orange',
                  'text-red-400 dark:text-red-300': slippageRemarks.color === 'red',
                })}
              >
                {slippageRemarks.message}
              </span>
            </div>
          )}
        </div> */}
        <Text color='dark:text-gray-400 text-gray-600' size='sm'>
          Your transaction will fail if the price changes more than the slippage. Too high of a value will result in an
          unfavorable trade.
        </Text>

        <Button disabled={proceedDisabled} onClick={handleOnProceedClick} className='w-full mt-4'>
          Confirm
        </Button>
      </div>
    </BottomModal>
  );
}
