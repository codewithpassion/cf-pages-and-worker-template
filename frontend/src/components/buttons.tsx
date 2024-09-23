import React from "react";

const ShimmerButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
      {children}
    </button>
  );
};

const NextButton: React.FC<
  React.DOMAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    disabled: boolean;
  }
> = ({ children, disabled, ...others }) => {
  return (
    <button
      disabled={disabled}
      {...others}
      className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] px-8 py-2 bg-[#0070f3] rounded-md text-white font-light transition duration-200 ease-linear"
    >
      {children}
    </button>
  );
};
export { ShimmerButton, NextButton };
