import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import pusher from "@/Utils/socket"; // Import the Pusher client instance

interface Message {
  text: string;
  sender: string;
}

interface ChatState {
  messages: { [conversationId: string]: Message[] }; 
}

const initialState: ChatState = {
  messages: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<{ conversationId: string; message: Message }>) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    // Remove the unused acceptDeal reducer
  },
});

// Listen for Pusher events
pusher.subscribe('conversation-channel').bind('new-message', (data: { conversationId: string; message: Message }) => {
  chatSlice.actions.addMessage(data);
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;