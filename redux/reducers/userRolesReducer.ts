import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = {
  id: number;
  name: string;
  nameAr: string;
  userCount?: number;
};

type UserRolesState = {
  roles: UserRole[];
  isLastPage: boolean;
  roleById: UserRole | null;
  lastDoc: any;
};

const initialState: UserRolesState = {
  roles: [],
  isLastPage: false,
  roleById: null,
  lastDoc: null,
};

export const userRolesSlice = createSlice({
  name: "userRoles",
  initialState,
  reducers: {
    setRoles(state, action: PayloadAction<UserRole[]>) {
      state.roles = action.payload;
    },

    setIsLastPage(state, action: PayloadAction<boolean>) {
      state.isLastPage = action.payload;
    },

    getRoleById(state, action: PayloadAction<number>) {
      const role = state.roles.find((role) => role.id === action.payload);
      state.roleById = role || null;
    },

    addRole(state, action: PayloadAction<UserRole>) {
      state.roles.push(action.payload);
    },

    updateRole(state, action: PayloadAction<UserRole>) {
      const index = state.roles.findIndex(
        (role) => role.id === action.payload.id
      );
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },

    deleteRole(state, action: PayloadAction<number>) {
      state.roles = state.roles.filter((role) => role.id !== action.payload);
    },

    setLastDoc(state, action: PayloadAction<any>) {
      state.lastDoc = action.payload;
    },
  },
});

export const {
  setRoles,
  setIsLastPage,
  addRole,
  updateRole,
  deleteRole,
  setLastDoc,
} = userRolesSlice.actions;

export default userRolesSlice.reducer;
