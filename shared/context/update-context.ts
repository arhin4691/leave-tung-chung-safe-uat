import { createContext } from "react";
import type { UpdateContextType } from "@/shared/types";

export const UpdateContext = createContext<UpdateContextType>({
  update: () => {},
  updateBack: () => {},
  updateNlb: () => {},
});
