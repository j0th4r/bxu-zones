import React, { useState } from 'react';
import { Shield, Users, FileText, Activity, Settings, LogOut } from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'zoning', label: 'Zoning Management', icon: FileText },
    { id: 'users', label: 'User Roles', icon: Users },
    { id: 'logs', label: 'AI Query Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="flex h-full">
        <div className="bg-gray-900 w-64 p-4">
          <div className="flex items-center space-x-2 mb-8">
            <Shield className="text-blue-400" size={24} />
            <h1 className="text-white font-bold text-lg">Admin Portal</h1>
          </div>
          
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={onClose}
              className="w-full flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Exit Portal</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-800 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold">Total Zones</h3>
                    <p className="text-2xl text-blue-400">47</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold">AI Queries Today</h3>
                    <p className="text-2xl text-green-400">124</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold">Active Users</h3>
                    <p className="text-2xl text-purple-400">18</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'zoning' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Zoning Management</h2>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300">Manage zoning geometries, ordinance text, and district properties.</p>
                  <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                    Edit Zoning Districts
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">User Role Management</h2>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300">Manage user permissions and access levels.</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-600 rounded">
                      <span className="text-white">admin@city.gov</span>
                      <span className="text-blue-400 text-sm">Administrator</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-600 rounded">
                      <span className="text-white">planner@city.gov</span>
                      <span className="text-green-400 text-sm">Editor</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">AI Query Logs</h2>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-600 rounded text-sm">
                      <div className="text-white">"What can I build on Main Street?"</div>
                      <div className="text-gray-400 text-xs mt-1">2 minutes ago</div>
                    </div>
                    <div className="p-3 bg-gray-600 rounded text-sm">
                      <div className="text-white">"Height limits in commercial zones"</div>
                      <div className="text-gray-400 text-xs mt-1">5 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};