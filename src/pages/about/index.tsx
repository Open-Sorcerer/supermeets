"use client";
import matchNFTs from "@/nfts/getMatchNFTs";
import { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { redis1, redis2 } from "@/utils/db";
import createRoom from "@/huddle01/createRoom";

interface NFTData {
  name: string;
  cached_image_uri: string;
  collection: {
    address: string;
  };
}

const About: NextPage = () => {
  const [selectedCardsList, setSelectedCardsList] = useState<string[]>([]);

  const { publicKey } = useWallet();

  const [supportedTokenAddressesMetadata, setSupportedTokenAddressesMetadata] =
    useState<NFTData[]>();

  const handleCardSelect = (address: string) => {
    if (selectedCardsList.includes(address)) {
      setSelectedCardsList(
        selectedCardsList.filter((item) => item !== address)
      );
    } else {
      setSelectedCardsList([...selectedCardsList, address]);
    }
  };

  const handleSubmit = async () => {
    await mapRoomWithWallet();
    // for (const address of selectedCardsList) {
    //   const value = (await redis1.get(address)) as string[] | null;
    //   if (value && publicKey) {
    //     if (!value.includes(publicKey?.toBase58())) {
    //       await redis1.set(address, [...value, publicKey?.toBase58()]);
    //     }
    //   } else {
    //     await redis1.set(address, [publicKey?.toBase58()]);
    //   }
    // }

    console.log("loggin fake details");

    const address = "8Rt3Ayqth4DAiPnW9MDFi63TiQJHmohfTWLMQFHi4KZH";

    const value = (await redis1.get(address)) as string[];

    await redis1.set(address, [
      "FRcfhfbffT6qyHwQRWAJAK2PoiEQS9AEgURtXrbYexUB",
      "5Yr566mbU4TaS5s8V4QmoZxo4K6bpwkFSsvRjfauA5pN",
      "2n5PbADyQXeCMztD5wnZjF3Nn2w8PmCmqSQ68TT6Q6KX",
    ]);
  };

  const mapRoomWithWallet = async () => {
    const roomId = await createRoom();
    if (roomId && publicKey) {
      await redis2.set(publicKey?.toBase58(), roomId);
    }
  };

  useEffect(() => {
    const getNFT = async () => {
      console.log(publicKey?.toBase58());
      const nfts = await matchNFTs(publicKey?.toBase58());
      setSupportedTokenAddressesMetadata(nfts);
    };
    getNFT();
  }, []);

  return (
    <div className="w-full h-full p-10 lg:px-40 flex justify-evenly flex-wrap">
      {supportedTokenAddressesMetadata &&
        supportedTokenAddressesMetadata.map((item: NFTData) => {
          return (
            <div
              key={item.collection.address}
              className={`w-[25vw] aspect-square flex flex-row justify-center items-center relative rounded-lg border ${
                selectedCardsList.includes(item.collection.address)
                  ? "border-red-500 border-4"
                  : "border-cardGray-700 hover:border-gray-700"
              } group overflow-clip`}
              onClick={() => handleCardSelect(item.collection.address)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={item.cached_image_uri}
                  alt="Logo"
                  loader={({ src }) => src}
                  layout="fill"
                  objectFit="cover"
                  loading="lazy"
                  className="group-hover:scale-110 transition-transform duration-75"
                />
              </div>
            </div>
          );
        })}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default About;
