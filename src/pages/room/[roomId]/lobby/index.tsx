import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useMeetPersistStore } from "@/store/meet";
import { useAppUtils } from "@huddle01/react/app-utils";
import {
  useAudio,
  useEventListener,
  useHuddle01,
  useLobby,
  useRoom,
  useVideo,
} from "@huddle01/react/hooks";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { useWallet } from "@solana/wallet-adapter-react";

import { BasicIcons } from "@/components/BasicIcons";
import SwitchDeviceMenu from "@/components/SwitchDeviceMenu";
import Image from "next/image";
import Spliner from "@components/Spliner";
import { redis2 } from "@utils/db";

interface RoomsInterface {
  roomId: string;
  partner: string | null;
}

const Lobby = () => {
  const { initialize, me, roomState } = useHuddle01();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { query, push } = useRouter();
  const { roomId: queryRoomId } = query;
  const { joinLobby, isLobbyJoined } = useLobby();
  const { joinRoom, isRoomJoined } = useRoom();
  const { fetchVideoStream, stopVideoStream, stream: camStream } = useVideo();
  const { fetchAudioStream, stopAudioStream, stream: micStream } = useAudio();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
  const { publicKey } = useWallet();
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const {
    toggleMicMuted,
    toggleCamOff,
    isMicMuted,
    isCamOff,
    videoDevice,
    audioInputDevice,
  } = useMeetPersistStore();

  const avatarURL = useMeetPersistStore((state) => state.avatarUrl);
  const displayUserName = useMeetPersistStore((state) => state.displayName);
  const setDisplayName = useMeetPersistStore((state) => state.setDisplayName);

  useEffect(() => {
    if (queryRoomId) {
      setRoomId(queryRoomId as string);
    }
  }, [queryRoomId]);
  
  useEffect(() => {
    if (roomId && process.env.NEXT_PUBLIC_PROJECT_ID) {
      if (roomState === "IDLE") {
        initialize(process.env.NEXT_PUBLIC_PROJECT_ID);
      }
      joinLobby(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (camStream && videoRef.current) {
      videoRef.current.srcObject = camStream;
    }
  }, [camStream]);

  useEventListener("app:cam-on", async () => {
    console.log("On");
    toggleCamOff(false);
  });

  useEventListener("app:cam-off", async () => {
    console.log("off");
    toggleCamOff(true);
  });

  useEventListener("app:mic-on", async () => {
    toggleMicMuted(false);
  });

  useEventListener("app:mic-off", async () => {
    toggleMicMuted(true);
  });

  useUpdateEffect(() => {
    if (!isCamOff) {
      stopVideoStream();
      fetchVideoStream(videoDevice.deviceId);
    }
  }, [videoDevice]);

  useUpdateEffect(() => {
    if (!isMicMuted) {
      stopAudioStream();
      fetchAudioStream(audioInputDevice.deviceId);
    }
  }, [audioInputDevice]);

  useEffect(() => {
    if (isRoomJoined && roomId) {
      push(`/room/${roomId}`);
    }
  }, [isRoomJoined, roomId]);

  return (
    <main className="bg-lobby flex h-[80vh] m-auto flex-col items-center justify-center">
      <Spliner
        scene={"https://prod.spline.design/HwOQpQ03zXBOxnw5/scene.splinecode"}
      />
      <div className="flex h-[35vh] w-[35vw] flex-col items-center justify-center gap-4 mt-32">
        <div className="relative mx-auto flex w-fit items-center justify-center rounded-lg text-center border border-zinc-800 bg-transparent">
          <div className="flex h-[40vh] aspect-video items-center justify-center rounded-lg">
            {camStream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="min-h-full min-w-full self-stretch rounded-lg object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col gap-4 justify-center items-center">
                <Image
                  src={me.avatarUrl ? `${me.avatarUrl}` : `${avatarURL}`}
                  loader={({ src }) => src}
                  alt="avatar"
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex bg-brand-900 items-center justify-center self-stretch rounded-lg py-2">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex w-full flex-row items-center justify-start gap-3">
              {!micStream ? (
                <button
                  type="button"
                  onClick={() => {
                    fetchAudioStream(audioInputDevice.deviceId);
                  }}
                  className="bg-brand-500 hover:bg-white/20 flex h-10 w-10 items-center justify-center rounded-xl"
                >
                  {BasicIcons.inactive["mic"]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    stopAudioStream();
                  }}
                  className="flex bg-gray-800 hover:bg-white/20 h-10 w-10 items-center justify-center rounded-xl"
                >
                  {BasicIcons.active["mic"]}
                </button>
              )}
              {!camStream ? (
                <button
                  type="button"
                  onClick={() => {
                    fetchVideoStream(videoDevice.deviceId);
                  }}
                  className="bg-brand-500 hover:bg-white/20 flex h-10 w-10 items-center justify-center rounded-xl"
                >
                  {BasicIcons.inactive["cam"]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVideoStream}
                  className="flex bg-gray-800 hover:bg-white/20 h-10 w-10 items-center justify-center rounded-xl"
                >
                  {BasicIcons.active["cam"]}
                </button>
              )}
            </div>
            <SwitchDeviceMenu />
          </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex w-2/3 h-full items-center">
            <div className="flex w-full flex-col justify-center gap-1 relative">
              <div className="w-full text-slate-300 flex items-center rounded-[10px] border border-zinc-800 pl-2 backdrop-blur-[400px]">
                <div className="mr-2">{BasicIcons.person}</div>
                <input
                  type="text"
                  placeholder="Enter your display name"
                  className="flex-1 rounded-lg border-transparent bg-transparent py-3 outline-none focus-within:outline-none hover:outline-none focus:border-transparent focus:outline-none"
                  value={displayUserName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <div className="mr-2" onClick={toggleDropdown}>
                  {BasicIcons.configure}
                </div>
              </div>
              <div
                className={`${
                  isDropdownOpen ? "block" : "hidden"
                } absolute top-full right-0 w-1/2 shadow-lg rounded-md bg-white/10 text-neutral-100 placeholder-neutral-600 placeholder:font-medium`}
              >
                <ul className="w-full">
                  <li
                    className="w-full px-5 hover:bg-brandPurple-dark rounded-t-md py-0.5"
                    // onClick={() => {
                    //   setMintNetwork("Polygon Mumbai");
                    // }}
                  >
                    Polygon
                  </li>
                  <li
                    className="w-full border-y border-brandGray-200/40 px-5 hover:bg-brandPurple-dark py-0.5"
                    // onClick={() => {
                    //   setMintNetwork("Avalanche Fuji");
                    // }}
                  >
                    Avalanche
                  </li>
                  <li
                    className="w-full px-5 hover:bg-brandPurple-dark rounded-b-md py-0.5"
                    // onClick={() => {
                    //   setMintNetwork("Fantom Testnet");
                    // }}
                  >
                    Fantom
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex h-full w-1/3 items-center">
            <button
              type="button"
              className="bg- bg-brand-500 flex w-full items-center justify-center rounded-md py-3 text-slate-100 bg-blue-600 group"
              onClick={async () => {
                if (isLobbyJoined) {
                  joinRoom();
                }
              }}
            >
              Start Meeting
              <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Lobby;
