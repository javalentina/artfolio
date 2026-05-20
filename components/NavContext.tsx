"use client";

import { createContext, useContext, useState } from "react";

type NavContextType = { open: boolean; setOpen: (v: boolean) => void };
const NavContext = createContext<NavContextType>({ open: false, setOpen: () => {} });

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <NavContext.Provider value={{ open, setOpen }}>{children}</NavContext.Provider>;
}

export const useNav = () => useContext(NavContext);
