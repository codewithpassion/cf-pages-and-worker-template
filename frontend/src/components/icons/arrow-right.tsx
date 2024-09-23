import React from 'react';

export type ArrowRightProps = React.HTMLAttributes<HTMLDivElement>;

const ArrowRight: React.FC<ArrowRightProps> = (props) => {
  const { className } = props;

  return (
    <svg className={`${className} h-8 w-8 text-black`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
};

export default ArrowRight;