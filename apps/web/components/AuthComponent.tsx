"use client"
import React, { useState } from 'react'
import { Input } from '@repo/ui/input'
import { Button } from '@repo/ui/button'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { authClient } from '@repo/auth/client'

export const AuthPage = ({ isSignin }: { isSignin: boolean }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rediretRoomId = searchParams.get("redirect");

  const handleAuth = async () => {
    setError(null);
    if (isSignin) {
      await authClient.signIn.email({
        email,
        password
      }, {
        onSuccess: () => router.push('/canvas/new'),
        onError: (ctx) => alert(ctx.error.message)
      });
    } else {
      await authClient.signUp.email({
        email,
        password,
        name,
      }, {
        onSuccess: () => router.push('/canvas/new'),
        onError: (ctx) => alert(ctx.error.message)
      })
      // try {
      //   const res = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/v1/users/${isSignin ? 'signin' : 'signup'}`, result.data)
      //   localStorage.setItem('token', `Bearer ${res.data.token}`);
      //   if (rediretRoomId) {
      //     router.push(`/canvas/${rediretRoomId}`);
      //   } else {
      //     router.push(`/canvas/${Math.floor(Math.random() * 1000)}`);
      //   } 
      // } catch (error: any) {
      //   setError(error.message as string || "An error occurred.");
      // }
    }
  }
  const handleGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/canvas/new"
    })
  }
  return (
    <>
      <div className='h-screen w-screen flex justify-center items-center bg-neutral-950'>
        {!isSignin && (
          <Input type='text' placeholder='name' onChange={(e) => setName(e.target.value)} className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full ' />
        )}
        <div className=''>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Input type='text' placeholder='email' onChange={(e) => setEmail(e.target.value)} className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full ' />
          <Input type='password' placeholder='password' onChange={(e) => setPassword(e.target.value)} className='rounded p-2 outline-none focus: outline-2 focus: outline-neutral-600 w-full' />

          <Button children={isSignin ? "Signin" : "Signup"} onClick={handleAuth} className='border-black outline-2 flex w-full justify-center bg-amber-500 p-2 rounded' />

          <Button children="Continue with Google" onClick={handleGoogle} className='border-black outline-2 flex w-full justify-center bg-amber-500 p-2 rounded' />

        </div>
      </div>
    </>
  )
}