"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import AboutModal from "@/shared/components/home/components/AboutModal";
import Modal from "@/shared/components/ui/Modal";
import { useLocale } from "@/shared/context/locale-context";
import { useTheme } from "@/shared/context/theme-context";
import { useFavouriteLists } from "@/shared/hooks/useFavouriteLists";
import { translations } from "@/shared/i18n/translations";
import type { FavouriteListTransfer } from "@/shared/util/favouriteLists";
import {
  createFavouriteListFromTransfer,
  createFavouriteListTransfer,
  parseFavouriteListTransfer,
  replaceFavouriteListRoutes,
} from "@/shared/util/favouriteLists";
import navClasses from "@/shared/components/ui/NavButton.module.css";
import classes from "./settings.module.css";

const QR_URL_LIMIT = 1200;

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function uniqueImportedName(name: string, lists: { name: string }[]) {
  const exists = (candidate: string) =>
    lists.some((list) => list.name.toLocaleLowerCase() === candidate.toLocaleLowerCase());
  if (!exists(name)) return name;

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const tag = ` (${suffix})`;
    const candidate = `${name.slice(0, 12 - tag.length)}${tag}`;
    if (!exists(candidate)) return candidate;
  }
  throw new Error("Unable to create a unique favourite list name.");
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { locale, t, toggleLocale } = useLocale();
  const {
    lists,
    selectedList,
    selectedListId,
    selectList,
    refresh,
    createList: createFavouriteList,
    renameList,
    deleteList,
    setDefaultList,
  } = useFavouriteLists();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newListName, setNewListName] = useState("");
  const [editedName, setEditedName] = useState("");
  const [pendingImport, setPendingImport] = useState<FavouriteListTransfer | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState("");
  const [safeText, setSafeText] = useState("");
  const [safeModalOpen, setSafeModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [qrTooLarge, setQrTooLarge] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isZh = locale === "zh-HK";

  useEffect(() => {
    setEditedName(selectedList?.name ?? "");
  }, [selectedList?.id, selectedList?.name]);

  useEffect(() => {
    const handleSharePayload = () => {
      const payload = new URLSearchParams(window.location.hash.slice(1)).get("payload");
      if (!payload) return;

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
      try {
        const imported = parseFavouriteListTransfer(
          JSON.parse(decodeBase64Url(payload)) as unknown,
        );
        setPendingImport(imported);
        setError("");
        setNotice("");
      } catch {
        setError(translations[locale]["settings.importInvalid"]);
      }
    };

    handleSharePayload();
    window.addEventListener("hashchange", handleSharePayload);
    return () => window.removeEventListener("hashchange", handleSharePayload);
  }, [locale]);

  useEffect(() => {
    if (!selectedList) return;
    let cancelled = false;
    const transfer = createFavouriteListTransfer(selectedList);
    const url = `${window.location.origin}/settings#payload=${encodeBase64Url(
      JSON.stringify(transfer),
    )}`;
    setShareUrl(url);
    setQrDataUrl("");
    setQrTooLarge(url.length > QR_URL_LIMIT);
    if (url.length > QR_URL_LIMIT) return;

    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 420,
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setError(translations[locale]["settings.qrError"]);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, selectedList]);

  const downloadJson = () => {
    if (!selectedList) return;
    const blob = new Blob(
      [JSON.stringify(createFavouriteListTransfer(selectedList), null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedList.name.replace(/[\\/:*?"<>|]/g, "_")}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const loadImport = (transfer: FavouriteListTransfer) => {
    setPendingImport(transfer);
    setError("");
    setNotice("");
  };

  const readImportFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setNotice("");
    try {
      if (file.size > 1_000_000) throw new Error("File is too large.");
      const parsed: unknown = JSON.parse(await file.text());
      loadImport(parseFavouriteListTransfer(parsed));
    } catch {
      setPendingImport(null);
      setError(t("settings.importInvalid"));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const importAsNewList = () => {
    if (!pendingImport) return;
    try {
      const name = uniqueImportedName(pendingImport.list.name, lists);
      const created = createFavouriteListFromTransfer(
        name,
        pendingImport.list.routes,
      );
      refresh();
      selectList(created.id);
      setPendingImport(null);
      setNotice(t("settings.importSuccessNew"));
      setError("");
    } catch {
      setError(t("settings.importInvalid"));
    }
  };

  const openReplaceConfirmation = () => {
    if (!pendingImport || !selectedList) return;
    setReplaceTargetId(selectedList.id);
    setSafeText("");
    setSafeModalOpen(true);
    setError("");
  };

  const confirmReplace = () => {
    if (!pendingImport || safeText !== "Safe") return;
    try {
      replaceFavouriteListRoutes(replaceTargetId, pendingImport.list.routes);
      refresh();
      selectList(replaceTargetId);
      setPendingImport(null);
      setSafeModalOpen(false);
      setNotice(t("settings.importSuccessReplace"));
      setError("");
      setSafeText("");
    } catch {
      setError(t("settings.importInvalid"));
      setSafeModalOpen(false);
    }
  };

  const createList = () => {
    if (!newListName.trim()) {
      setError(t("settings.nameRequired"));
      return;
    }
    if (newListName.trim().length > 12) {
      setError(t("settings.nameTooLong"));
      return;
    }
    const created = createFavouriteList(newListName);
    if (!created) {
      setError(t("settings.nameDuplicate"));
      return;
    }
    selectList(created.id);
    setNewListName("");
    setError("");
    setNotice(t("settings.listCreated"));
  };

  const saveListName = () => {
    if (!selectedList) return;
    if (!editedName.trim()) {
      setError(t("settings.nameRequired"));
      return;
    }
    if (editedName.trim().length > 12) {
      setError(t("settings.nameTooLong"));
      return;
    }
    if (!renameList(selectedList.id, editedName)) {
      setError(t("settings.nameDuplicate"));
      return;
    }
    setError("");
    setNotice(t("settings.listRenamed"));
  };

  const removeSelectedList = () => {
    if (!selectedList || lists.length <= 1) return;
    if (!window.confirm(`${t("settings.deleteConfirm")} ${selectedList.name}`)) {
      return;
    }
    deleteList(selectedList.id);
    setNotice(t("settings.listDeleted"));
    setError("");
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice(t("settings.copySuccess"));
      setError("");
    } catch {
      setError(t("settings.copyError"));
    }
  };

  const targetList = lists.find((list) => list.id === replaceTargetId);

  return (
    <main className={classes.page}>
      <header className={classes.pageHeader}>
        <div>
          <p className={classes.eyebrow}>東涌出行 · 1.2</p>
          <h1>{t("settings.title")}</h1>
        </div>
      </header>

      <section className={classes.section}>
        <h2>{t("settings.appearance")}</h2>
        <div className={classes.preferenceGrid}>
          <button type="button" className={classes.actionButton} onClick={toggleTheme}>
            {theme === "dark" ? t("settings.lightMode") : t("settings.darkMode")}
          </button>
          <button type="button" className={classes.actionButton} onClick={toggleLocale}>
            {isZh ? "Switch to English" : "切換中文"}
          </button>
        </div>
        <div className={classes.about}>
          <AboutModal version="1.2" releaseDate="2026-11-05" classes={navClasses} />
        </div>
      </section>

      <section className={classes.section}>
        <h2>{t("settings.favourites")}</h2>
        <label className={classes.fieldLabel} htmlFor="favourite-list-select">
          {t("settings.chooseList")}
        </label>
        <select
          id="favourite-list-select"
          className={classes.input}
          value={selectedListId}
          onChange={(event) => selectList(event.target.value)}
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
              {list.isDefault ? ` · ${t("settings.defaultList")}` : ""}
              {` · ${list.routes.length} ${t("settings.routeCount")}`}
            </option>
          ))}
        </select>

        {selectedList && (
          <>
            <div className={classes.nameEditor}>
              <label className={classes.fieldLabel} htmlFor="favourite-list-name">
                {t("settings.listName")}
              </label>
              <div className={classes.inlineForm}>
                <input
                  id="favourite-list-name"
                  className={classes.input}
                  value={editedName}
                  maxLength={12}
                  onChange={(event) => setEditedName(event.target.value)}
                />
                <button type="button" className={classes.actionButton} onClick={saveListName}>
                  {t("settings.renameList")}
                </button>
              </div>
            </div>

            <div className={classes.listActions}>
              {!selectedList.isDefault && (
                <button
                  type="button"
                  className={classes.actionButton}
                  onClick={() => setDefaultList(selectedList.id)}
                >
                  {t("settings.makeDefault")}
                </button>
              )}
              {lists.length > 1 && (
                <button
                  type="button"
                  className={`${classes.actionButton} ${classes.dangerButton}`}
                  onClick={removeSelectedList}
                >
                  {t("settings.deleteList")}
                </button>
              )}
              <button type="button" className={classes.actionButton} onClick={downloadJson}>
                {t("settings.export")}
              </button>
            </div>

            <p className={classes.listSummary}>
              {selectedList.routes.length} {t("settings.routeCount")}
            </p>
            {selectedList.routes.length === 0 ? (
              <p className={classes.muted}>{t("settings.emptyList")}</p>
            ) : (
              <ul className={classes.routeList}>
                {selectedList.routes.map((route, index) => (
                  <li key={`${route.company}-${route.route}-${route.stopId}-${index}`}>
                    <strong>{route.route}</strong>
                    <span>{route.company}</span>
                    <span>{route.name_tc || route.name_en || route.stopId}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className={classes.createForm}>
          <label className={classes.fieldLabel} htmlFor="new-favourite-list">
            {t("settings.newListName")}
          </label>
          <div className={classes.inlineForm}>
            <input
              id="new-favourite-list"
              className={classes.input}
              value={newListName}
              maxLength={12}
              onChange={(event) => setNewListName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") createList();
              }}
            />
            <button type="button" className={classes.primaryButton} onClick={createList}>
              {t("settings.createList")}
            </button>
          </div>
        </div>
      </section>

      {selectedList && (
        <section className={classes.section}>
          <h2>{t("settings.qrShare")}</h2>
          <p className={classes.muted}>{t("settings.qrHint")}</p>
          {qrTooLarge ? (
            <p className={classes.error}>{t("settings.qrTooLarge")}</p>
          ) : qrDataUrl ? (
            <div className={classes.qrPanel}>
              <Image
                className={classes.qrImage}
                src={qrDataUrl}
                alt={t("settings.qrShare")}
                width={420}
                height={420}
                unoptimized
              />
              <div className={classes.qrActions}>
                <a
                  className={classes.actionButton}
                  href={qrDataUrl}
                  download={`${selectedList.name.replace(/[\\/:*?"<>|]/g, "_")}-qr.png`}
                >
                  {t("settings.downloadQr")}
                </a>
                <button type="button" className={classes.actionButton} onClick={copyShareLink}>
                  {t("settings.copyLink")}
                </button>
              </div>
            </div>
          ) : (
            <p className={classes.muted}>{t("common.loadingEllipsis")}</p>
          )}
        </section>
      )}

      <section className={classes.section}>
        <h2>{t("settings.import")}</h2>
        <p className={classes.muted}>{t("settings.importHint")}</p>
        <input
          ref={fileInputRef}
          className={classes.hiddenInput}
          type="file"
          accept=".json,application/json"
          onChange={(event) => void readImportFile(event.target.files?.[0])}
        />
        <button
          type="button"
          className={classes.actionButton}
          onClick={() => fileInputRef.current?.click()}
        >
          {t("settings.chooseFile")}
        </button>

        {pendingImport && (
          <div className={classes.importPreview}>
            <h3>{t("settings.pendingImport")}</h3>
            <p>
              <strong>{t("settings.sourceList")}:</strong> {pendingImport.list.name}
            </p>
            <p>
              {pendingImport.list.routes.length} {t("settings.routeCount")}
            </p>
            <div className={classes.importActions}>
              <button type="button" className={classes.primaryButton} onClick={importAsNewList}>
                {t("settings.importNew")}
              </button>
              {selectedList ? (
                <div className={classes.replaceChoice}>
                  <label className={classes.fieldLabel} htmlFor="replace-target">
                    {t("settings.chooseList")}
                  </label>
                  <select
                    id="replace-target"
                    className={classes.input}
                    value={selectedListId}
                    onChange={(event) => selectList(event.target.value)}
                  >
                    {lists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} · {list.routes.length} {t("settings.routeCount")}
                      </option>
                    ))}
                  </select>
                  <p className={classes.warning}>{t("settings.overwriteWarning")}</p>
                  <button
                    type="button"
                    className={`${classes.actionButton} ${classes.dangerButton}`}
                    onClick={openReplaceConfirmation}
                  >
                    {t("settings.importReplace")}
                  </button>
                </div>
              ) : (
                <p className={classes.muted}>{t("settings.noLists")}</p>
              )}
              <button
                type="button"
                className={classes.textButton}
                onClick={() => setPendingImport(null)}
              >
                {t("settings.cancel")}
              </button>
            </div>
          </div>
        )}
      </section>

      {(error || notice) && (
        <p className={error ? classes.error : classes.notice} role={error ? "alert" : "status"}>
          {error || notice}
        </p>
      )}

      <Modal
        show={safeModalOpen}
        header={t("settings.safeTitle")}
        onCancel={() => {
          setSafeModalOpen(false);
          setSafeText("");
        }}
        size="sm"
        footer={
          <div className={classes.modalActions}>
            <button
              type="button"
              className={classes.actionButton}
              onClick={() => {
                setSafeModalOpen(false);
                setSafeText("");
              }}
            >
              {t("settings.cancel")}
            </button>
            <button
              type="button"
              className={`${classes.primaryButton} ${classes.dangerButton}`}
              disabled={safeText !== "Safe" || !targetList}
              onClick={confirmReplace}
            >
              {t("settings.confirmOverwrite")}
            </button>
          </div>
        }
      >
        <p>
          {t("settings.safePrompt")}: <strong>{targetList?.name ?? ""}</strong>
        </p>
        <input
          autoFocus
          className={classes.input}
          value={safeText}
          onChange={(event) => setSafeText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && safeText === "Safe") confirmReplace();
          }}
          placeholder={t("settings.safePlaceholder")}
          autoComplete="off"
        />
      </Modal>
    </main>
  );
}
