"use client"
import React from 'react'
import {Input} from '@repo/ui/input'
import { Button } from '@repo/ui/button'

export const AuthPage = ({isSignin}: {isSignin: boolean}) => {
  const handleClick = () => {
    return;
  }
  return (
    <>
      <div className='h-screen w-screen flex justify-center items-center bg-neutral-950'>
        <div className=''>
          <Input type='text' placeholder='email' className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full '/>
          <Input type='password' placeholder='password' className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full'/>
          <Button children={isSignin? "Signin" : "Signup"} onClick={()=> handleClick} className='border-black outline-2 flex w-full justify-center bg-amber-500 p-2 rounded' />
        </div>
      </div>
    </>
  )
}