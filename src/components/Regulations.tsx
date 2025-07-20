import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, X, Calendar } from 'lucide-react';

interface Regulation {
  id: string;
  zoneCode: string;
  zoneName: string;
  chapter: string;
  article: string;
  section: string;
  far: string;
  heightLimit: string;
  lastUpdated: string;
  ordinanceRef: string;
  effectiveDate: string;
  allowedUses: string;
  prohibitedUses: string;
  setbackRequirements: string;
  parkingRequirements: string;
  specialProvisions: string;
  history: Array<{
    date: string;
    action: string;
    ordinance: string;
  }>;
}

export const Regulations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [editingRegulation, setEditingRegulation] = useState<Regulation | null>(null);

  const [regulations] = useState<Regulation[]>([
    {
      id: '1',
      zoneCode: 'C5-3',
      zoneName: 'Central Commercial District',
      chapter: 'Chapter 32 - Zoning',
      article: 'Article IV - Commercial Districts',
      section: 'Section 32-40 - C5 Districts',
      far: '15',
      heightLimit: 'N/A',
      lastUpdated: '2023-08-15',
      ordinanceRef: 'Ord. No. 2023-05',
      effectiveDate: '09/01/2023',
      allowedUses: `Office buildings
Retail establishments
Hotels
Residential (with special permit)
Entertainment venues
Cultural facilities`,
      prohibitedUses: `Heavy manufacturing
Warehousing
Auto repair shops
Gas stations`,
      setbackRequirements: 'Initial setback distance of 20 feet from street line on wide streets',
      parkingRequirements: 'None required in Manhattan Core',
      specialProvisions: `Eligible for floor area bonuses for public plazas
Subject to Special Midtown District regulations
May participate in air rights transfers`,
      history: [
        { date: '2023-08-15', action: 'Updated FAR from 12.0 to 15.0', ordinance: 'Ord. No. 2023-05' },
        { date: '2020-06-10', action: 'Added special provision for air rights transfers', ordinance: 'Ord. No. 2020-12' }
      ]
    },
    {
      id: '2',
      zoneCode: 'R8B',
      zoneName: 'Residential District',
      chapter: 'Chapter 32 - Zoning',
      article: 'Article II - Residential Districts',
      section: 'Section 32-20 - R8 Districts',
      far: '4',
      heightLimit: '75',
      lastUpdated: '2023-07-10',
      ordinanceRef: 'Ord. No. 2023-03',
      effectiveDate: '08/01/2023',
      allowedUses: `Single-family residences
Multi-family residences
Home occupations
Community facilities`,
      prohibitedUses: `Commercial establishments
Industrial uses
Auto repair shops
Heavy manufacturing`,
      setbackRequirements: 'Front yard: 25 feet minimum, Side yards: 8 feet minimum each side',
      parkingRequirements: '1 space per dwelling unit',
      specialProvisions: `Maximum building coverage: 30% of lot area
Minimum open space: 70% of lot area
Height limit applies to principal building only`,
      history: [
        { date: '2023-07-10', action: 'Reduced minimum front yard from 30 to 25 feet', ordinance: 'Ord. No. 2023-03' }
      ]
    },
    {
      id: '3',
      zoneCode: 'M1-5',
      zoneName: 'Light Manufacturing District',
      chapter: 'Chapter 32 - Zoning',
      article: 'Article V - Manufacturing Districts',
      section: 'Section 32-50 - M1 Districts',
      far: '5',
      heightLimit: 'N/A',
      lastUpdated: '2023-06-20',
      ordinanceRef: 'Ord. No. 2023-02',
      effectiveDate: '07/01/2023',
      allowedUses: `Light manufacturing
Research and development
Warehousing and storage
Wholesale trade
Commercial vehicle storage`,
      prohibitedUses: `Residential uses
Heavy manufacturing
Hazardous waste processing
Retail establishments over 10,000 sq ft`,
      setbackRequirements: 'Front yard: 20 feet, Side yards: 15 feet minimum',
      parkingRequirements: '1 space per 1,000 sq ft of floor area',
      specialProvisions: `Loading berths required for buildings over 20,000 sq ft
Special soundproofing requirements near residential zones
Environmental impact assessment required for certain uses`,
      history: [
        { date: '2023-06-20', action: 'Added environmental assessment requirement', ordinance: 'Ord. No. 2023-02' }
      ]
    }
  ]);

  const [formData, setFormData] = useState<Partial<Regulation>>({
    zoneCode: '',
    zoneName: '',
    chapter: '',
    article: '',
    section: '',
    far: '',
    heightLimit: '',
    ordinanceRef: '',
    effectiveDate: '',
    allowedUses: '',
    prohibitedUses: '',
    setbackRequirements: '',
    parkingRequirements: '',
    specialProvisions: ''
  });

  const handleEdit = (regulation: Regulation) => {
    setEditingRegulation(regulation);
    setFormData(regulation);
    setIsModalOpen(true);
    setActiveTab('general');
  };

  const handleCreate = () => {
    setEditingRegulation(null);
    setFormData({
      zoneCode: '',
      zoneName: '',
      chapter: '',
      article: '',
      section: '',
      far: '',
      heightLimit: '',
      ordinanceRef: '',
      effectiveDate: '',
      allowedUses: '',
      prohibitedUses: '',
      setbackRequirements: '',
      parkingRequirements: '',
      specialProvisions: ''
    });
    setIsModalOpen(true);
    setActiveTab('general');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRegulation(null);
    setActiveTab('general');
  };

  const handleInputChange = (field: keyof Regulation, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredRegulations = regulations.filter(reg =>
    reg.zoneCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.zoneName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'uses', label: 'Uses' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'history', label: 'History' }
  ];

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'rgb(3 7 18 / var(--tw-bg-opacity, 1))' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Zoning Regulations</h1>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Regulation
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search regulations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Zone Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Zone Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Chapter</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">FAR</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Height Limit</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Updated</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredRegulations.map((regulation) => (
                <tr key={regulation.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">{regulation.zoneCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{regulation.zoneName}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{regulation.chapter}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{regulation.far}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{regulation.heightLimit}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{regulation.lastUpdated}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(regulation)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingRegulation ? 'Edit Regulation' : 'Create New Regulation'}
                </h2>
                <p className="text-gray-400 mt-1">
                  {editingRegulation ? 'Make changes to the existing zoning regulation.' : 'Add a new zoning regulation to the system.'}
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Zone Code</label>
                      <input
                        type="text"
                        value={formData.zoneCode || ''}
                        onChange={(e) => handleInputChange('zoneCode', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., C5-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Zone Name</label>
                      <input
                        type="text"
                        value={formData.zoneName || ''}
                        onChange={(e) => handleInputChange('zoneName', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Central Commercial District"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Chapter</label>
                      <input
                        type="text"
                        value={formData.chapter || ''}
                        onChange={(e) => handleInputChange('chapter', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Chapter 32 - Zoning"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Article</label>
                      <input
                        type="text"
                        value={formData.article || ''}
                        onChange={(e) => handleInputChange('article', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Article IV - Commercial Districts"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
                      <input
                        type="text"
                        value={formData.section || ''}
                        onChange={(e) => handleInputChange('section', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Section 32-40 - C5 Districts"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ordinance Reference</label>
                      <input
                        type="text"
                        value={formData.ordinanceRef || ''}
                        onChange={(e) => handleInputChange('ordinanceRef', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ord. No. 2023-05"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Effective Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.effectiveDate || ''}
                          onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="09/01/2023"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Uses Tab */}
              {activeTab === 'uses' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Allowed Uses</label>
                    <textarea
                      value={formData.allowedUses || ''}
                      onChange={(e) => handleInputChange('allowedUses', e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      placeholder="Office buildings&#10;Retail establishments&#10;Hotels&#10;Residential (with special permit)&#10;Entertainment venues&#10;Cultural facilities"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prohibited Uses</label>
                    <textarea
                      value={formData.prohibitedUses || ''}
                      onChange={(e) => handleInputChange('prohibitedUses', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      placeholder="Heavy manufacturing&#10;Warehousing&#10;Auto repair shops&#10;Gas stations"
                    />
                  </div>
                </div>
              )}

              {/* Requirements Tab */}
              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Building Height Limit (ft)</label>
                      <input
                        type="text"
                        value={formData.heightLimit || ''}
                        onChange={(e) => handleInputChange('heightLimit', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="75"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Floor Area Ratio (FAR)</label>
                      <input
                        type="text"
                        value={formData.far || ''}
                        onChange={(e) => handleInputChange('far', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Setback Requirements</label>
                    <textarea
                      value={formData.setbackRequirements || ''}
                      onChange={(e) => handleInputChange('setbackRequirements', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Initial setback distance of 20 feet from street line on wide streets"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Parking Requirements</label>
                    <textarea
                      value={formData.parkingRequirements || ''}
                      onChange={(e) => handleInputChange('parkingRequirements', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="None required in Manhattan Core"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Special Provisions</label>
                    <textarea
                      value={formData.specialProvisions || ''}
                      onChange={(e) => handleInputChange('specialProvisions', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Eligible for floor area bonuses for public plazas&#10;Subject to Special Midtown District regulations&#10;May participate in air rights transfers"
                    />
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div>
                  {editingRegulation && editingRegulation.history.length > 0 ? (
                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-indigo-400">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-indigo-400">Action</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-indigo-400">Ordinance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {editingRegulation.history.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-white">{item.date}</td>
                              <td className="px-4 py-3 text-sm text-gray-300">{item.action}</td>
                              <td className="px-4 py-3 text-sm text-gray-300">{item.ordinance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p>No history available for this regulation.</p>
                      {!editingRegulation && (
                        <p className="mt-2 text-sm">History will be created when the regulation is saved.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 