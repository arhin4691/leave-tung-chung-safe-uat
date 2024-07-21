import { createContext } from "react";

export const UpdateContext = createContext({
  update: () => {},
  updateBack: () => {},
  updateNlb: () => {},
});
