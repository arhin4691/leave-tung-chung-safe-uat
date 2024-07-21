import { Grid } from "@mui/material";
import Image from "next/image";
import React from "react";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Modal from "../../ui/Modal";
import Card from "../../ui/Card";

const AboutModal = (props) => {
  const logoFile = "/files/images/logo.png";
  const footer = <Button onClick={props.onClose}>關閉</Button>;
  const content = (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <div className="center mb-5">
            <Image src={logoFile} alt="Logo" width={150} height={100} />
          </div>
        </Grid>
        <Grid item xs={12}>
          <Card disabled classNames="p-2">
            <div className="badge-primary center p-1">開發者的話</div>
            <span className="text-primary">
              開發者搬進東涌，發現交通何其疏落。有見及此，設計本應用程式。希望從東涌出發的居民及想要進入東涌的市民能使用本應用程式令行程更有預算﹑更方便。歡迎電郵至
              <a
                href={`mailto:leave.tung.chung.safe@gmail.com?subject=我想向東涌出行提供意見
                      &body=版本號碼: ${props.version}
                        %20%3A%0D%0A意見內容: `}
                className="text-success badge-success-outline"
              >
                這裡
              </a>
            </span>
            提供意見。
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Input
            id="search"
            type="text"
            label="版本號碼"
            element="input"
            placeholder={props.version}
            onInput={() => {}}
            validators={[]}
            sticky
            onGetValue={() => {}}
            autocomplete={"off"}
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <Input
            id="search"
            type="text"
            label="發佈日期"
            element="input"
            placeholder={props.releaseDate}
            onInput={() => {}}
            validators={[]}
            sticky
            onGetValue={() => {}}
            autocomplete={"off"}
            disabled
          />
        </Grid>
      </Grid>
    </>
  );
  return (
    <Modal show={props.show} size="sm" footer={footer} onCancel={props.onClose}>
      {content}
    </Modal>
  );
};

export default AboutModal;
