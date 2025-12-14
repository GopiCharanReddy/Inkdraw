"use client";

import { HTMLInputTypeAttribute } from "react";

interface InputProps {
  type: HTMLInputTypeAttribute,
  placeholder: string,
  className?: string 
}

export const Input = ({type, placeholder, className}:InputProps) => {
  return (
    <div className="my-2">
      <input className={className} type={type} placeholder={placeholder} />
    </div>
  )
}