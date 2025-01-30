import React, { useState } from "react";
import { X } from "lucide-react";
import type { User } from "../types";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (
    name: string,
    description: string,
    memberIds: number[]
  ) => void;
  availableUsers: User[];
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
  availableUsers,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName, groupDescription, selectedUsers);
      setGroupName("");
      setSelectedUsers([]);
      onClose();
    }
  };

  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Description
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
              placeholder="Describe the purpose of this group..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Add a description to help members understand the group's purpose
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Members
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleUser(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="mr-2"
                  />
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={!groupName.trim() || selectedUsers.length === 0}
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}