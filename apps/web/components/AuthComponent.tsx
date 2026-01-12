"use client"
import React, { useState } from 'react'
import { Input } from '@repo/ui/input'
import { Button } from '@repo/ui/button'
import axios from 'axios'
import { UserSchema } from '@repo/schema'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export const AuthPage = ({ isSignin }: { isSignin: boolean }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rediretRoomId = searchParams.get("redirect");

  const handleClick = async () => {
    setError(null);

    const result = UserSchema.safeParse({
      username,
      email,
      password
    })
    if (!result.success) {
      const issues = result.error.issues
      const errorMessage = issues[0]?.message || "Validation Failed"
      setError(errorMessage);
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/v1/users/${isSignin ? 'signin' : 'signup'}`, result.data)
      localStorage.setItem('token',`Bearer ${res.data.token}`);
      if(rediretRoomId) {
        router.push(`/canvas/${rediretRoomId}`);
      } else {
        router.push(`/canvas/${Math.floor(Math.random() * 1000)}`);
      }
    } catch (error: any) {
      setError(error.message as string || "An error occurred.");
    }
  }
  return (
    <>
      <div className='h-screen w-screen flex justify-center items-center bg-neutral-950'>
        <div className=''>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Input type='text' placeholder='username' onChange={(e) => setUsername(e.target.value)} className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full ' />
          <Input type='text' placeholder='email' onChange={(e) => setEmail(e.target.value)} className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full ' />
          <Input type='password' placeholder='password' onChange={(e) => setPassword(e.target.value)} className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full' />
          <Button children={isSignin ? "Signin" : "Signup"} onClick={handleClick} className='border-black outline-2 flex w-full justify-center bg-amber-500 p-2 rounded' />
        </div>
      </div>
    </>
  )
}