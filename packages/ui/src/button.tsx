"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick: () => void;
}

export const Button = ({ children, className, onClick }: ButtonProps) => {

  return (
    <button
      className={`${className} m-2 border border-black p-2 px-4 hover:border-2 hover:bg-neutral-100`} onClick={onClick}
    >
      {children}
    </button>
  );
};
