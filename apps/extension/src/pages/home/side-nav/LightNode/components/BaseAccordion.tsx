import { CaretUp } from '@phosphor-icons/react';
import Text from 'components/text';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { cn } from 'utils/cn';

const BasicAccordion = ({
  title,
  children,
  isExpanded,
  toggleAccordion,
}: {
  title: string | React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  toggleAccordion: () => void;
}) => {
  return (
    <div className='w-full flex-col bg-secondary-100 flex items-center justify-between p-4 gap-3 rounded-2xl overflow-hidden'>
      <div
        role='button'
        tabIndex={0}
        onClick={toggleAccordion}
        className='w-full flex-row flex justify-between items-center gap-2 cursor-pointer'
      >
        <span className='text-sm font-medium'>{title}</span>

        <CaretUp size={16} className={cn('transition-transform duration-300', !isExpanded && 'rotate-180')} />
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key='more-details'
            initial={{ height: 0, opacity: 0.6 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0.6 }}
            transition={{ duration: 0.1 }}
            className='w-full'
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BasicAccordion;
