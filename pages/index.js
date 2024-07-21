import BusFavList from "@/shared/components/bus_routes/components/BusFavList";
import AboutModal from "@/shared/components/home/components/AboutModal";
import { UpdateContext } from "@/shared/context/update-context";
import { Grid } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import RoadStatus from "../shared/components/home/RoadStatus";
import Card from "@/shared/components/ui/Card";

export default function Home(props) {
  const logoFile = "/files/images/logo.png";
  const [likedItem, setLikedItem] = useState("");
  const [likedBack, setLikedBack] = useState("");
  const [likedNlb, setLikedNlb] = useState("");

  useEffect(() => {

    localStorage.getItem("likedBus")
      ? setLikedItem(localStorage.getItem("likedBus").replace(/,\s*$/, ""))
      : localStorage.removeItem("likedBus");
    localStorage.getItem("likedBack")
      ? setLikedBack(localStorage.getItem("likedBack").replace(/,\s*$/, ""))
      : localStorage.removeItem("likedBack");
    localStorage.getItem("likedNlb")
      ? setLikedNlb(localStorage.getItem("likedNlb").replace(/,\s*$/, ""))
      : localStorage.removeItem("likedNlb");
  }, []);

  //About Handler
  const [showAbout, setShowAbout] = useState(false); 
  const openAboutHandler = () => {
    setShowAbout(true);
  };
  const closeAboutHandler = () => {
    setShowAbout(false);
  };

  return (
    <UpdateContext.Provider
      value={{
        update: () => {
          setLikedItem(
            window.localStorage.getItem("likedBus").replace(/,\s*$/, "")
          );
        },
        updateBack: () => {
          setLikedBack(
            window.localStorage.getItem("likedBack").replace(/,\s*$/, "")
          );
        },
        updateNlb: () => {
          setLikedNlb(
            window.localStorage.getItem("likedNlb").replace(/,\s*$/, "")
          );
        },
      }}
    >
      <>
        <Head>
          <title>東涌出行 - 主頁</title>
          <meta
            name="description"
            content="Welcome to Leave Tung Chung Safe App"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AboutModal
          releaseDate={props.updates[0].date}
          version={props.updates[0].version}
          onClose={closeAboutHandler}
          show={showAbout}
        />
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Card static classNames="p-2 center">
              <Image
                src={logoFile}
                alt="Logo"
                width={75}
                height={50}
                onClick={openAboutHandler}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <BusFavList
              data={JSON.parse("[" + likedItem + "]")}
              backData={JSON.parse("[" + likedBack + "]")}
              nlbData={JSON.parse("[" + likedNlb + "]")}
              mode={"home"}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <RoadStatus />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card disabled classNames="p-2">
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <div className="banner banner-primary center">更新日誌</div>
                </Grid>
                <Grid container spacing={0}>
                  {props.updates.slice(0,6).map((x) => (
                    <Grid item xs={12} md={6} key={x.version}>
                      <div className="white-background-static p-2 m-2">
                        <Grid container spacing={0}>
                          <Grid item xs={12}>
                            <div className="display-7 text-primary align-left">
                              {x.info}
                            </div>
                          </Grid>
                          <Grid item xs={12}>
                            <div className="badge-secondary-outline align-left display-8 ">
                              版本號碼: {x.version}
                            </div>
                            <div className="badge-primary-super align-right display-8 ">
                              {x.date}
                            </div>
                          </Grid>
                        </Grid>
                      </div>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </>
    </UpdateContext.Provider>
  );
}

export async function getStaticProps() {
  const UPDATES = [
    {
      date: "2024-02-26",
      info: "新増馬灣巴士路線",
      version: "0.1708934",
    },
    {
      date: "2024-02-18",
      info: "全新介面及增強至所有巴士路線",
      version: "0.1708268",
    },
    {
      date: "2024-02-13",
      info: "增強外觀流暢度",
      version: "0.1707814",
    },
    {
      date: "2023-11-25",
      info: "去除臭蟲",
      version: "0.1700898",
    },
    {
      date: "2023-10-22",
      info: "新增同站路線",
      version: "0.1697981",
    },
    {
      date: "2023-10-21",
      info: "去除臭蟲",
      version: "0.1697871",
    },
    {
      date: "2023-08-03",
      info: "重塑巴士常用次序",
      version: "0.1691070",
    },
    {
      date: "2023-07-30",
      info: "新增停車場資訊 (根據政府提供應用程式介面)",
      version: "0.1690709b",
    },
  ];

  return {
    props: {
      updates: UPDATES,
    },
    revalidate: 600000,
  };
}
