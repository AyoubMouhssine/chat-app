import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, LogOut, Users, Plus } from "lucide-react";
import type { ApiResponse, Message, User, Group } from "../types";
import api from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import Loader from "./Loader";
import CreateGroupModal from "./CreateGroupModal";
import messageApi from "../services/messageApi";
import SockJS from "sockjs-client";
import { CompatClient, Stomp, StompSubscription } from "@stomp/stompjs";

interface ChatState {
  type: "user" | "group";
  id: number;
}

interface UnreadMessages {
  [key: string]: number;
}

export default function Chat() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({});
  // const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const stompClientRef = useRef<CompatClient>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReceivedMessage = useCallback((receivedMessage: Message) => {
    if (!user) return;

    const isFromCurrentChat = selectedChat && (
      (selectedChat.type === "user" && 
        ((receivedMessage.senderId === selectedChat.id && receivedMessage.receiverId === user.id) ||
         (receivedMessage.senderId === user.id && receivedMessage.receiverId === selectedChat.id))) ||
      (selectedChat.type === "group" && receivedMessage.groupId === selectedChat.id)
    );

    if (isFromCurrentChat) {
      setMessages(prev => [...prev, receivedMessage]);
    } else if (receivedMessage.senderId !== user.id) {
      // Update unread count for the sender
      const chatId = receivedMessage.groupId 
        ? `group_${receivedMessage.groupId}` 
        : `user_${receivedMessage.senderId}`;
      
      setUnreadMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || 0) + 1
      }));
    }
  }, [selectedChat, user]);

  // Clear unread messages when selecting a chat
  const handleSelectChat = (chat: ChatState) => {
    const chatId = chat.type === "group" ? `group_${chat.id}` : `user_${chat.id}`;
    setUnreadMessages(prev => ({
      ...prev,
      [chatId]: 0
    }));
    setSelectedChat(chat);
  };

  // WebSocket connection setup
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    stompClientRef.current = client;

    let subscription: StompSubscription;

    client.connect({}, () => {
      subscription = client.subscribe("/topic/messages", (message) => {
        const receivedMessage = JSON.parse(message.body);
        handleReceivedMessage(receivedMessage);
      });
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      client.disconnect();
    };
  }, [isAuthenticated, navigate, handleReceivedMessage]);

  // Initial data fetching
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await Promise.all([fetchUsers(), fetchGroups()]);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      initializeChat();
    }
  }, [isAuthenticated]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const fetchUsers = async () => {
    try {
      const response = await api.get<ApiResponse<User[]>>("/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get<ApiResponse<Group[]>>("/user/groups");
      setGroups(response.data.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchMessages = async (chat: ChatState) => {
    try {
      const endpoint =
        chat.type === "user"
          ? `/messages/history/${chat.id}`
          : `/messages/group/${chat.id}`;
      const response = await messageApi.get<Message[]>(endpoint);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      alert("Failed to load messages");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim() || !user) return;

    try {
      const message = {
        senderId: user.id,
        message: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...(selectedChat.type === "user"
          ? { receiverId: Number(selectedChat.id) }
          : { groupId: Number(selectedChat.id) }),
      };

      stompClientRef.current?.publish({
        destination: '/app/chat',
        body: JSON.stringify(message)
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateGroup = async (
    name: string,
    description: string,
    memberIds: number[]
  ) => {
    try {
      await api.post("/groups", { name, description, memberIds });
      await fetchGroups();
      setIsCreateGroupModalOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      stompClientRef.current?.disconnect();
      dispatch(logout());
    } catch (error) {
      console.error("Error logging out:", error);
      dispatch(logout());
    }
  };

  if (loading) {
    return <Loader />;
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    return date;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] mt-16 bg-gray-100">
      <div className="w-1/4 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Create Group"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Groups List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Groups</h3>
            <div className="space-y-2">
              {groups.map((group) => {
                const unreadCount = unreadMessages[`group_${group.id}`] || 0;
                return (
                  <div
                    key={group.id}
                    onClick={() => handleSelectChat({ type: "group", id: group.id })}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?.id === group.id && selectedChat.type === "group"
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Users className="w-8 h-8 text-gray-500 mr-2" />
                    <div className="flex-1">
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-gray-500">
                        {group.members.length} members
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Direct Messages
            </h3>
            <div className="space-y-2">
              {users.map((chatUser) => {
                const unreadCount = unreadMessages[`user_${chatUser.id}`] || 0;
                return (
                  <div
                    key={chatUser.id}
                    onClick={() => handleSelectChat({ type: "user", id: chatUser.id })}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?.id === chatUser.id && selectedChat.type === "user"
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={chatUser.avatar}
                        alt={`${chatUser.name} avatar`}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span
                        className={`absolute bottom-0 right-2 w-3 h-3 rounded-full border-2 border-white ${
                          chatUser.status === "online"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{chatUser.name}</p>
                      <p className="text-sm text-gray-500">
                        {chatUser.status === "online" ? "Online" : "Offline"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="font-semibold">
                {selectedChat.type === "user"
                  ? users.find((u) => u.id === selectedChat.id)?.name
                  : groups.find((g) => g.id === selectedChat.id)?.name}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                        message.senderId === user?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {selectedChat.type === "group" && message.senderId !== user?.id && (
                        <p className="text-xs font-medium mb-1">
                          {users.find((u) => u.id === message.senderId)?.name}
                        </p>
                      )}
                      <p>{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-white"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        availableUsers={users}
      />
    </div>
  );
}