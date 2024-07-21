import Head from "next/head";
import { UpdateContext } from "@/shared/context/update-context";
import { useState, useEffect } from "react";
import BusFavList from "@/shared/components/bus_routes/components/BusFavList";
import InitToast from "@/shared/components/ui/InitToast";

export default function Home(props) {
  const [likedItem, setLikedItem] = useState("");
  const [likedBack, setLikedBack] = useState("");
  const [likedNlb, setLikedNlb] = useState("");

  useEffect(() => {
    localStorage.getItem("likedBus")
      ? setLikedItem(localStorage.getItem("likedBus").replace(/,\s*$/, ""))
      : setLikedItem("");
    localStorage.getItem("likedBack")
      ? setLikedBack(localStorage.getItem("likedBack").replace(/,\s*$/, ""))
      : setLikedBack("");
    localStorage.getItem("likedNlb")
      ? setLikedNlb(localStorage.getItem("likedNlb").replace(/,\s*$/, ""))
      : setLikedNlb("");
  }, []);

  return (
    <>
      <Head>
        <title>東涌出行 - 常用</title>
        <meta
          name="description"
          content="Welcome to Leave Tung Chung Safe App - Favourite"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <InitToast
        message={`這是你常用頁面`}
        theme="colored"
        duration={800}
        type="info"
        position="top-center"
        className="top-over"
      />
      <BusFavList
        data={JSON.parse("[" + likedItem + "]")}
        backData={JSON.parse("[" + likedBack + "]")}
        nlbData={JSON.parse("[" + likedNlb + "]")}
      />
    </>
  );
}
