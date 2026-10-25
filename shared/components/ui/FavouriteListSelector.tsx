"use client";

import React, { useEffect, useState } from "react";
import type { FavouriteList, FavRouteStop } from "@/shared/types";
import { useLocale } from "@/shared/context/locale-context";
import AppDropdown from "./AppDropdown";

interface FavouriteListSelectorProps {
  open: boolean;
  lists: FavouriteList[];
  route: FavRouteStop | null;
  onClose: () => void;
  onAdd: (listId: string, route: FavRouteStop) => void;
  onCreate: (name: string) => FavouriteList | null;
  allowCreate?: boolean;
}

const FavouriteListSelector: React.FC<FavouriteListSelectorProps> = ({
  open,
  lists,
  route,
  onClose,
  onAdd,
  onCreate,
  allowCreate = true,
}) => {
  const { t } = useLocale();
  const [selectedId, setSelectedId] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const existing = route
      ? lists.find((list) =>
          list.routes.some(
            (item) =>
              item.stopId === route.stopId &&
              item.route === route.route &&
              item.company === route.company,
          ),
        )
      : undefined;
    setSelectedId(
      existing?.id ??
        lists.find((list) => list.isDefault)?.id ??
        lists[0]?.id ??
        "",
    );
    setCreating(false);
    setName("");
    setError("");
  }, [open, route?.stopId, route?.route, route?.company]);

  const createList = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError(t("fav.nameRequired"));
      return;
    }
    if (cleanName.length > 12) {
      setError(t("fav.nameTooLong"));
      return;
    }
    if (
      lists.some(
        (list) => list.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase(),
      )
    ) {
      setError(t("fav.nameDuplicate"));
      return;
    }
    const created = onCreate(cleanName);
    if (!created) {
      setError(t("fav.nameDuplicate"));
      return;
    }
    setSelectedId(created.id);
    setCreating(false);
    setName("");
    setError("");
  };

  const submit = () => {
    if (route && selectedId) onAdd(selectedId, route);
    onClose();
  };

  return (
    <AppDropdown
      open={open}
      onClose={onClose}
      title={t("fav.addTo")}
      options={lists.map((list) => ({
        value: list.id,
        label: list.name,
        icon: list.isDefault ? "📌" : undefined,
        count: list.routes.length,
      }))}
      value={selectedId}
      onSelect={setSelectedId}
      allowCreate={allowCreate && !creating}
      onCreateClick={() => {
        setCreating(true);
        setError("");
      }}
      createLabel={t("fav.createNewList")}
      confirmLabel={t("fav.add")}
      cancelLabel={t("fav.cancel")}
      onConfirm={submit}
    >
      {creating && (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <input
            autoFocus
            value={name}
            maxLength={12}
            placeholder={t("fav.listNamePlaceholder")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                createList();
              }
            }}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            style={inputStyle}
          />
          {error && (
            <span role="alert" style={{ color: "var(--accent-red)", fontSize: 12 }}>
              {error}
            </span>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
                setError("");
              }}
              style={secondaryButtonStyle}
            >
              {t("fav.cancel")}
            </button>
            <button type="button" onClick={createList} style={primaryButtonStyle}>
              {t("fav.create")}
            </button>
          </div>
        </div>
      )}
    </AppDropdown>
  );
};

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "rgba(255,255,255,0.06)",
  color: "var(--text-primary)",
  font: "inherit",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  flex: 1,
  border: "1px solid var(--accent-blue)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "var(--accent-blue)",
  color: "#fff",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: "10px 12px",
  outline: "none",
  background: "var(--glass-bg)",
  color: "var(--text-primary)",
  font: "inherit",
};

export default FavouriteListSelector;
