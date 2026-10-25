"use client";

import { useCallback, useEffect, useState } from "react";
import type { FavouriteList, FavouriteRoute } from "@/shared/types";
import {
  addRouteToFavouriteList,
  createFavouriteList,
  deleteFavouriteList,
  getFavouriteLists,
  removeRouteFromFavouriteList,
  renameFavouriteList,
  setDefaultFavouriteList,
} from "@/shared/util/favouriteLists";

const INITIAL_LIST: FavouriteList = {
  id: "default",
  name: "我的最愛",
  routes: [],
  isDefault: true,
  createdAt: 0,
};

export function useFavouriteLists() {
  const [lists, setLists] = useState<FavouriteList[]>([INITIAL_LIST]);
  const [selectedListId, setSelectedListId] = useState(INITIAL_LIST.id);

  useEffect(() => {
    const stored = getFavouriteLists();
    setLists(stored);
    setSelectedListId(
      stored.find((list) => list.isDefault)?.id ?? stored[0].id,
    );
  }, []);

  const refresh = useCallback(() => {
    const updated = getFavouriteLists();
    setLists(updated);
    setSelectedListId((current) =>
      updated.some((list) => list.id === current)
        ? current
        : (updated.find((list) => list.isDefault)?.id ?? updated[0].id),
    );
    return updated;
  }, []);

  const createList = useCallback(
    (name: string) => {
      const created = createFavouriteList(name);
      if (created) refresh();
      return created;
    },
    [refresh],
  );

  const renameList = useCallback(
    (id: string, name: string) => {
      const renamed = renameFavouriteList(id, name);
      if (renamed) refresh();
      return renamed;
    },
    [refresh],
  );

  const deleteList = useCallback(
    (id: string) => {
      const updated = deleteFavouriteList(id);
      setLists(updated);
      setSelectedListId((current) =>
        updated.some((list) => list.id === current)
          ? current
          : (updated.find((list) => list.isDefault)?.id ?? updated[0].id),
      );
    },
    [],
  );

  const setDefaultList = useCallback((id: string) => {
    setLists(setDefaultFavouriteList(id));
    setSelectedListId(id);
  }, []);

  const addRoute = useCallback(
    (id: string, route: FavouriteRoute) => {
      setLists(addRouteToFavouriteList(id, route));
    },
    [],
  );

  const removeRoute = useCallback(
    (id: string, route: FavouriteRoute) => {
      setLists(removeRouteFromFavouriteList(id, route));
    },
    [],
  );

  return {
    lists,
    selectedListId,
    selectedList: lists.find((list) => list.id === selectedListId) ?? lists[0],
    selectList: setSelectedListId,
    refresh,
    createList,
    renameList,
    deleteList,
    setDefaultList,
    addRoute,
    removeRoute,
  };
}
