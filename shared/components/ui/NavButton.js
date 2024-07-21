import Link from "next/link";
import React, { useEffect, useState } from "react";
import classes from "./NavButton.module.css";
import { MdOutlineFavorite, MdHome, MdOutlineExitToApp } from "react-icons/md";
import Image from "next/image";

const NavButton = () => {
  const [showButtons, setShowButtons] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);

  const logoFile = "/files/images/logo.png";

  const style = {
    color: "white",
  };
  const handleClick = () => {
    if (showButtons) {
      setHideButtons(true);
      const timeout = setTimeout(() => {
        setShowButtons(false);
        setHideButtons(false);
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      setShowButtons(true);
    }
  };

  useEffect(() => {
    if (showButtons) {
      const timeout = setTimeout(() => {
        handleClick();
      }, 5000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [showButtons]);

  const iconBus = "/files/images/icon_bus.png";
  const iconMTR = "/files/images/icon_mtr.png";
  const iconCarPark = "/files/images/carpark.png";

  return (
    <>
      <div className={`${classes.buttoncontainer}`}>
        {showButtons && (
          <>
            <span
              className={`${classes.upperbutton} ${
                hideButtons ? classes.hide : ""
              } ${classes.green}`}
              data-delay="0"
              onClick={handleClick}
            >
              <Link href="/car_park">
                <span style={style}>
                  <Image src={iconCarPark} width={50} height={50} alt="停車場" />
                </span>
              </Link>
            </span>
          </>
        )}
        {showButtons && (
          <>
            <span
              className={`${classes.upperbutton} ${
                hideButtons ? classes.hide : ""
              } ${classes.blue}`}
              data-delay="0"
              onClick={handleClick}
            >
              <Link href="/">
                <span style={style}>
                  <MdHome />
                </span>
              </Link>
            </span>
          </>
        )}
      </div>
      <div className={`${classes.buttoncontainer}`}>
        {showButtons && (
          <>
            <span
              className={`${classes.smallbutton} ${
                hideButtons ? classes.hide : ""
              } ${classes.red}`}
              data-delay="0"
              onClick={handleClick}
            >
              <Link href="/mtr">
                <span style={style}>
                  <Image src={iconMTR} width={70} height={70} alt="地鐵路線" />
                </span>
              </Link>
            </span>
          </>
        )}
        <span className={`${classes.mainbutton}`} onClick={handleClick}>
          <Image
            src={logoFile}
            alt="Logo"
            width={75}
            height={50}
            layout="responsive"
          />
        </span>

        {showButtons && (
          <>
            <span
              className={`${classes.smallbutton} ${
                hideButtons ? classes.hide : ""
              }  ${classes.yellow}`}
              data-delay="0"
              onClick={handleClick}
            >
              <Link href="/go_back">
                <span style={style}>
                  <Image src={iconBus} width={70} height={70} alt="巴士路線" />
                </span>
              </Link>
            </span>
          </>
        )}
      </div>
    </>
  );
};

export default NavButton;
