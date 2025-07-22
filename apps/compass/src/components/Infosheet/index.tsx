import BottomModal from 'components/bottom-modal';
import Text from 'components/text';
import React from 'react';

export default function InfoSheet({
  desc,
  heading,
  title,
  isVisible,
  setVisible,
}: {
  heading: string;
  title: string;
  desc: string;
  isVisible: boolean;
  
  setVisible: (v: boolean) => void;
}) {
  return (
    <BottomModal isOpen={isVisible} onClose={() => setVisible(false)} title={title} className='flex flex-col gap-1.5'>
      <span className='text-secondary-foreground text-sm font-bold'>{heading}</span>
      <span className='text-sm'>{desc}</span>
    </BottomModal>
  );
}
