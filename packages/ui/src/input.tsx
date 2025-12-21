"use client";

import { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

interface InputProps {
  type: HTMLInputTypeAttribute,
  placeholder: string,
  className?: string,
  onChange: ChangeEventHandler<HTMLInputElement>,
}

export const Input = ({type, placeholder, className, onChange}:InputProps) => {
  return (
    <div className="my-2">
      <input className={className} type={type} placeholder={placeholder} onChange={onChange}/>
    </div>
  )
}