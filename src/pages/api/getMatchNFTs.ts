import { writeFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from 'next'

interface APIData {
  success: boolean;
  message: string;
  result: any;
}

interface NFTData {
  name: string;
  cached_image_uri: string;
  collection: {
    address: string;
  };
}

const nftCommunityCollection = [
  {
    CollectionName: "Solana Monkey Business Gen2",
    address: "SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W",
  },
  {
    CollectionName: "Madlads",
    address: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w",
  },
  {
    CollectionName: "Superteam",
    address: "E4ToMjm8YtRyfPUhZ7hxRMxe4J8FnSr9CcprytZBYFua",
  },
  {
    CollectionName: "Solana Monkey Business Gen3",
    address: "8Rt3Ayqth4DAiPnW9MDFi63TiQJHmohfTWLMQFHi4KZH",
  },
  {
    CollectionName: "Claynosaurz",
    address: "6mszaj17KSfVqADrQj3o4W3zoLMTykgmV37W4QadCczK",
  },
];

const matchNFTs = async (req: NextApiRequest, res: NextApiResponse) => {
  const address = "2pgp7NaXWqycNJ7kaFF9uvs2MQ1hd3dG2Gh27VUUzxcA";
  const { wallet_address } = req.body;
  const url = "https://api.shyft.to/sol/v1/nft/read_all?network=mainnet-beta&address="+address;
  const response = await fetch(url, {
    headers: {
      "X-API-KEY": process.env.SHYFT_API_KEY || "",
    },
  });
  const data = (await response.json()) as APIData;
  const nfts: NFTData[] = data.result;
  
  // Only return NFTs that are in the community collection
  const nftCommunityCollectionAddresses = nftCommunityCollection.map(
    (nft) => nft.address
  );

  const filteredNFTs = nfts?.filter((nft: NFTData) =>
    nftCommunityCollectionAddresses.includes(nft.collection.address)
  );

  writeFileSync("./nfts.json", JSON.stringify(filteredNFTs));

  if (!filteredNFTs) {
    return res.status(404).json({ message: "No NFTs found" });
  };
  return res.status(200).json(filteredNFTs);
};

export default matchNFTs;
