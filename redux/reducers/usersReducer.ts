import { UserRole } from "@/types/userRole";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  role: UserRole;
  role_id: string;
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

type InitialStateType = {
  users: User[];
  usersSearch: User[];
  order: any[];
  count: number;
  isLastPage: boolean;
};

const initialState: InitialStateType = {
  users: [],
  usersSearch: [],
  order: [],
  count: 0,
  isLastPage: false,
};

export const usersReducer = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    setSearchUsers(state, action: PayloadAction<User[]>) {
      state.usersSearch = action.payload;
    },
    setUsersCount(state, action: PayloadAction<number>) {
      state.count = action.payload;
    },
    setIsLastPage(state, action: PayloadAction<boolean>) {
      state.isLastPage = action.payload;
    },
    addUser(state, action: PayloadAction<User>) {
      state.users.unshift(action.payload);
    },
    deleteUser(state, action: PayloadAction<string>) {
      state.users = state.users.map((user) =>
        user.id === action.payload ? { ...user, isDeleted: true } : user,
      );
    },
    updateUser(state, action: PayloadAction<User>) {
      state.users = state.users.map((user) =>
        user.id === action.payload.id ? { ...user, ...action.payload } : user,
      );
    },
  },
});

export const {
  setUsers,
  setSearchUsers,
  setUsersCount,
  setIsLastPage,
  addUser,
  updateUser,
  deleteUser,
} = usersReducer.actions;
