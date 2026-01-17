"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export type LoggedUser = {
  role: string;
  role_id?: string;
  roleStats: any;
  email: string;
  full_name: string;
  id: string;
  image_url: string | null;
  phone: string;
  created_at?: string;
  updated_at?: string;
  password_last_updated?: string;
  last_login_at?: string;
  UserAddress?: any[];
  is_confirmed?: boolean;
  lang?: string;
  is_Active?: boolean;
  birth_date?: string;
  gender: string;
  deleted_at?: string;
};

type TypeContext = {
  user: LoggedUser;
  token: string;
  updateUser: (updatedUser: Partial<LoggedUser>) => void;
  setUser: (user: LoggedUser) => void;
};

const ProviderContext = createContext<TypeContext>({
  user: {} as LoggedUser,
  token: "",
  updateUser: () => {},
  setUser: () => {},
});

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL as string;
axios.defaults.withCredentials = true;

const ProviderApp = ({
  children,
  user: initialUser,
  token,
}: {
  children: React.ReactNode;
  user: LoggedUser;
  token: string;
}) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<LoggedUser>(initialUser);

  // Function to update specific user fields
  const updateUser = (updatedUser: Partial<LoggedUser>) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUser }));
  };

  const contextValue = React.useMemo(
    () => ({
      user,
      token,
      updateUser,
      setUser,
    }),
    [user, token]
  );

  return (
    <ProviderContext.Provider value={contextValue}>
      <div className="flex">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="flex-1 content-container">
          <Navbar setOpen={setOpen} />
          {children}
        </div>
      </div>
    </ProviderContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(ProviderContext);
};

export default ProviderApp;
