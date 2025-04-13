// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./auth/authSlice";
import formReducer from "./form/formSlice";
import { authAPI } from "./auth/authAPI";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    form: formReducer,
    [authAPI.reducerPath]: authAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["form/updateFormData"],
        ignoredPaths: ["form.formData.profilePicture"],
      },
    }).concat(authAPI.middleware),
});

setupListeners(store.dispatch);

export default store;
