// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./auth/authSlice";
import formReducer from "./form/formSlice";
import { authAPI } from "./auth/authAPI";
import matchReducer from "./match/matchSlice";
import userReducer from "./user/userSlice";
import notificationReducer from "./notification/notificationSlice";
import chatReducer from "./chat/chatSlice";
import blockReducer from "./block/blockSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    form: formReducer,
    user: userReducer,
    matches: matchReducer,
    chat: chatReducer,
    notifications: notificationReducer,
    block: blockReducer,
    [authAPI.reducerPath]: authAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["form/updateFormData"],
        ignoredPaths: ["form.formData.profilePicture"],
        ignoredPaths: ["items.dates"],
      },
    }).concat(authAPI.middleware),
});

setupListeners(store.dispatch);

export default store;
