import { useRoom } from "@huddle01/react/hooks";
import { useEffect } from "react";
import { useRouter } from "next/router"
import Meet from "@components/Meet";

const Home = ({ params }: { params: { roomId: string } }) => {
  
    const { isRoomJoined } = useRoom();
    const { push } = useRouter();

    useEffect(() => {
      if (!isRoomJoined) {
        push(`/room/${params.roomId}/lobby`);
        return;
      }
    }, []);

    return <Meet />;
    
};

export default Home;
