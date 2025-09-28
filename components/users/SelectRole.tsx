import { useAppContext } from "@/context/appContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SelectRole = () => {
  const [roles, setRoles] = useState([]);
  const { token } = useAppContext();
  const fetchRoles = async () => {
    try {
      const { data } = await axios.get("/api/role", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoles(data?.roles);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchRoles();
  }, []);
  return (
    <>
      {roles.map((role: any) => {
        return (
          <option key={role.id} value={role?.id}>
            {role?.name}
          </option>
        );
      })}
    </>
  );
};

export default SelectRole;
