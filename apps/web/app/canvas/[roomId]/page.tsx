"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { authClient } from '@repo/auth/client'
import { LoaderFive } from "@/components/ui/loader";
import dynamic from "next/dynamic";

const CanvasRoom = dynamic(() => import("../../../components/canvas/CanvasRoom"), {
  ssr: false,
  loading: () => <LoaderFive text="Loading Canvas..." />
})

const Page = () => {
  const [token, setToken] = useState<string>("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const params = useParams();
  const roomId = params.roomId as string;

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await authClient.getSession();

      if (data?.session.token) {
        setToken(data.session.token)
      } else {
        setToken("")
      }
      setIsAuthChecked(true);
    }
    fetchSession();
  }, []);

  return (
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-col gap-y-20 items-center justify-center bg-neutral-50">
        {isAuthChecked ?
          <div>
            <CanvasRoom roomId={roomId} token={token} />
          </div>
          :
          <LoaderFive text="Loading Canvas..." />
        }
      </div>
    </>
  )
}

export default Page;