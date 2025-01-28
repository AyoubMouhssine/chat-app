import React, { useState, useEffect} from 'react';
import { Send, LogOut } from 'lucide-react';
import type { ApiResponse, Message, User } from '../types';
import api  from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import Loader from './Loader';

export default function Chat() {
  const {isAuthenticated} = useSelector((state:RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchUsers();
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users');      
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await api.get<Message[]>(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    try {
      const message = {
        content: newMessage,
        receiverId: selectedUser,
        timestamp: new Date().toISOString(),
      };

      await api.post('/messages', message);
      setNewMessage('');
      if (selectedUser) {
        fetchMessages(selectedUser);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
    console.log("logout");
    return;
      await api.post("/logout");
      dispatch(logout());
  };


  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Users Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Users</h2>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            
          </button>
        </div>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`flex items-center p-3 rounded-lg cursor-pointer ${
                selectedUser === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* <UserCircle className="w-8 h-8 text-gray-500 mr-2" /> */}
              <img src={user.avatar} alt={`${user.name} avatar`} width="30" height="30"/>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === 'currentUser'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                        message.senderId === 'currentUser'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
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
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}