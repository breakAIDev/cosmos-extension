import React from 'react';

const FilledDownArrowSvg = React.memo((props: React.SVGProps<SVGSVGElement>) => (
  <svg width='6' height='5' viewBox='0 0 6 5' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='M0.258325 1.75834L2.41666 3.91668C2.74166 4.24168 3.26666 4.24168 3.59166 3.91668L5.74999 1.75834C6.27499 1.23334 5.89999 0.333344 5.15833 0.333344H0.841659C0.0999919 0.333344 -0.266675 1.23334 0.258325 1.75834Z' />
  </svg>
));

FilledDownArrowSvg.displayName = 'DownArrowSvg';
export { FilledDownArrowSvg };
