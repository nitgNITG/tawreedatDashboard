"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { User } from "@/redux/reducers/usersReducer";

type TypeContext = {
  user: User;
  token: string;
  updateUser: (updatedUser: Partial<User>) => void;
  setUser: (user: User) => void;
};

const ProviderContext = createContext<TypeContext>({
  user: {} as User,
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
  user: User;
  token: string;
}) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User>(initialUser);

  // Function to update specific user fields
  const updateUser = (updatedUser: Partial<User>) => {
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
