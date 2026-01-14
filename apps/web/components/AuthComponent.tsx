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
  const redirectRoomId = searchParams.get("redirect");
  const destinationUrl = redirectRoomId ? `/canvas/${redirectRoomId}` : `/canvas/${crypto.randomUUID()}`;
  const handleAuth = async () => {
    setError(null);
    if (isSignin) {
      await authClient.signIn.email({
        email,
        password
      }, {
        onSuccess: () => {
          if (redirectRoomId) {
            router.push(destinationUrl)
          } else {
            router.push(destinationUrl)
          }
        },
        onError: (ctx) => alert(ctx.error.message)
      });
    } else {
      await authClient.signUp.email({
        email,
        password,
        name,
      }, {
        onSuccess: () => {
          if (redirectRoomId) {
            router.push(destinationUrl)
          } else {
            router.push(destinationUrl)
          }
        },
        onError: (ctx) => alert(ctx.error.message)
      })
    }
  }
  const handleGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: destinationUrl,
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