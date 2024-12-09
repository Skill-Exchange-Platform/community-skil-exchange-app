import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/features/auth/authSlice";
import userReducer from "@/lib/features/dashboard/userSlice";
import skillsReducer from "@/lib/features/skills/skillsSlice";
import categoryReducer from "@/lib/features/skills/categorySlice";
import reviewsReducer from "@/lib/features/reviews/reviewSlice";
import chatReducer from "@/lib/features/chat/chatSlice";
import dealReducer from "@/lib/features/deal/dealSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    skills: skillsReducer,
    category: categoryReducer,
    reviews: reviewsReducer,
    chat: chatReducer,
    deal: dealReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;