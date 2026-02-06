"use client";
import React, { EventHandler, FormEventHandler, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { authClient } from '@repo/auth/client'
import Link from "next/link";

export const AuthPage = ({ isSignin }: { isSignin: boolean }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectRoomId = searchParams.get("redirect");
  const destinationUrl = redirectRoomId ? `/canvas/${redirectRoomId}` : `/canvas/${crypto.randomUUID()}`;
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        onError: (ctx) => {
          console.log("Full error context:", ctx);
          alert(ctx.error.message ?? "An unknown error occurred");
        }
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
        onError: (ctx) => {
          console.log("Full error context:", ctx);
          alert(ctx.error.message ?? "An unknown error occurred");
        }
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
    <div className="h-screen flex items-center w-screen bg-neutral-100">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Welcome to Inkdraw
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          A free, open-source and instant virtual whiteboard application with online collaboration.
        </p>

        <form className="my-8" onSubmit={handleAuth}>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            {!isSignin &&
              (<LabelInputContainer>
                <Label htmlFor="name">Name</Label>
                <Input id="name" onChange={(e) => setName(e.target.value)} placeholder="Tyler" type="text" />
              </LabelInputContainer>
              )}
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" onChange={(e) => setEmail(e.target.value)} placeholder="tylerdurden@gmail.com" type="email" />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          </LabelInputContainer>
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
          >
            {isSignin ? "Signin" : "Signup"}&rarr;
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <div className="flex flex-col space-y-4">
            <button onClick={handleGoogle}
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
              type="button"
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
        <div className="text-center">
          {isSignin ? "Don't have an account yet?" : "Are you an existing user?"} <Link className="text-blue-500 hover:underline cursor-pointer" href={isSignin ? "/signup" : "/signin"}>{isSignin ? "Signup" : "Signin"}</Link>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};