import { setCookie } from "./setCookie";

export const deleteCookie = (name: string) => {
    setCookie(name, '', -1); // Set expiration date to past
};