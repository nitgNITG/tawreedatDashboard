import { configureStore } from "@reduxjs/toolkit";
import { dashboardReducer } from "../reducers/dashboard";
import { usersReducer } from "../reducers/usersReducer";
import { suppliersReducer } from "../reducers/suppliersReducer";
import { productsSlice } from "../reducers/productsReducer";
import { categoriesSlice } from "../reducers/categoriesReducer";
import { imagesSlice } from "../reducers/ImageGallary";
import { articlesSlice } from "../reducers/articlesReducer";
import { faqsSlice } from "../reducers/faqsReducer";
import { aboutDataSlice } from "../reducers/aboutAppReducer";
import { translateReducer } from "../reducers/translateReducer";
import { couponsSlice } from "../reducers/couponReducer";
import { petsSlice } from "../reducers/petsReducer";
import { speciesSlice } from "../reducers/speciesReducer";
import { onboardingSlice } from "../reducers/onBoardsReducer";
import { adsSlice } from "../reducers/adsReducer";
import { badgesSlice } from "../reducers/badgesReducer";
import { giftCardsSlice } from "../reducers/giftCardsReducers";
import { userRolesSlice } from "../reducers/userRolesReducer";
import { notificationSlice } from "../reducers/notificationSlice";
import contactsReducer from "../reducers/contactsReducer";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer.reducer,
    users: usersReducer.reducer,
    suppliers: suppliersReducer.reducer,
    products: productsSlice.reducer,
    category: categoriesSlice.reducer,
    images: imagesSlice.reducer,
    articles: articlesSlice.reducer,
    faqs: faqsSlice.reducer,
    contacts: contactsReducer.reducer,
    about: aboutDataSlice.reducer,
    translate: translateReducer.reducer,
    coupons: couponsSlice.reducer,
    pets: petsSlice.reducer,
    species: speciesSlice.reducer,
    onboarding: onboardingSlice.reducer,
    ads: adsSlice.reducer,
    userRoles: userRolesSlice.reducer,
    giftCards: giftCardsSlice.reducer,
    badges: badgesSlice.reducer,
    notifications: notificationSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["categories/setLastDoc", "products/setLastDoc"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["category.lastDoc", "products.lastDoc"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
