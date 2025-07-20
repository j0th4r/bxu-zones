import React from 'react';
import { Users } from 'lucide-react';






export const AdminUsers: React.FC = () => {
  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Users</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">User Management</h3>
          </div>
          <p className="text-gray-400">Manage user accounts and access permissions.</p>
        </div>
      </div>
    </div>
  );
}; 