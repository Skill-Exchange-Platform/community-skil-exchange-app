'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pusher from 'pusher-js';
import { RootState } from '@/lib/store';
import { selectedUserById } from '@/lib/features/dashboard/userSlice';

const ChatSidebar = ({ onSelectConversation, conversations }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.currentUser);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const fetchUserDetails = async (userId) => {
      const action = await dispatch(selectedUserById(userId));
      if (!action.error) {
        setUsers((prevUsers) => ({ ...prevUsers, [userId]: action.payload }));
      }
    };

    conversations.forEach((conversation) => {
      const userId = conversation.providerId._id === user.id ? conversation.seekerId._id : conversation.providerId._id;

      if (!users[userId]) {
        fetchUserDetails(userId).then(() => {
          console.log('Fetched user details for userId:', userId);
        });
      }
    });
  }, [conversations, dispatch, user.id, users]);

  useEffect(() => {
    const pusher = new Pusher('b85eae341f11d9507db7', {
      cluster: 'eu',
    });

    const channel = pusher.subscribe('presence-online-users');
    channel.bind('pusher:subscription_succeeded', (members) => {
      setOnlineUsers(Object.keys(members.members));
    });

    channel.bind('pusher:member_added', (member) => {
      setOnlineUsers((prevUsers) => [...prevUsers, member.id]);
    });

    channel.bind('pusher:member_removed', (member) => {
      setOnlineUsers((prevUsers) => prevUsers.filter((id) => id !== member.id));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const groupedConversations = conversations.reduce((acc, conversation) => {
    const userId = conversation.providerId._id === user.id ? conversation.seekerId._id : conversation.providerId._id;
    const userName = users[userId]?.data.name || (conversation.providerId._id === user.id ? conversation.seekerId.name : conversation.providerId.name);
    const userPhoto = users[userId]?.data.photo;

    if (!acc[userId]) {
      acc[userId] = { userName, userPhoto, conversations: [] };
    }
    acc[userId].conversations.push(conversation);
    return acc;
  }, {});

  return (
    <div className="w-full md:w-1/4 bg-white p-4 border-r border-gray text-black">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>
      <ul className="space-y-2 text-black">
        {Object.entries(groupedConversations).map(([userId, { userName, userPhoto, conversations }]) => (
          <li key={userId} className="p-2 rounded-lg shadow-sm bg-white">
            <div className="flex items-center mb-2 cursor-pointer" onClick={() => onSelectConversation(conversations)}>
              {userPhoto && <img src={userPhoto} alt={userName} className="h-8 w-8 rounded-full mr-2" />}
              <span className={`h-2 w-2 rounded-full mr-2 ${isUserOnline(userId) ? 'bg-green' : 'bg-gray'}`}></span>
              {userName}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSidebar;

