import React, { useState, useRef, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, ChevronDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  zoneCode: string;
  category: string;
  lastUpdated: string;
}

export const FAQs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [faqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'What can I build in a C5-3 zone?',
      answer: 'In a C5-3 zone (Central Commercial District), you can build high-density commercial buildings including office towers, retail establishments, hotels, and entertainment venues. Residential use is permitted with special permits. There is no absolute height limit, but buildings are subject to sky exposure plane regulations. The maximum Floor Area Ratio (FAR) is 15.0, which can be increased with bonuses for public amenities.',
      zoneCode: 'C5-3',
      category: 'Use',
      lastUpdated: '2023-08-20'
    },
    {
      id: '2',
      question: 'What is the height limit in R8B zones?',
      answer: 'In R8B residential zones, the maximum building height is 75 feet or 7 stories, whichever is less. Buildings must also comply with sky exposure plane regulations and setback requirements.',
      zoneCode: 'R8B',
      category: 'Height',
      lastUpdated: '2023-07-15'
    },
    {
      id: '3',
      question: 'How many parking spaces are required in M1-5 zones?',
      answer: 'In M1-5 manufacturing zones, the parking requirement is typically 1 space per 1,000 square feet of floor area for manufacturing uses. However, specific requirements may vary based on the type of manufacturing operation.',
      zoneCode: 'M1-5',
      category: 'Parking',
      lastUpdated: '2023-06-30'
    },
    {
      id: '4',
      question: 'What is the maximum FAR in R6 districts?',
      answer: 'The maximum Floor Area Ratio (FAR) in R6 residential districts is 2.43 for non-contextual buildings and varies for contextual buildings based on lot size and street width.',
      zoneCode: 'R6',
      category: 'Density',
      lastUpdated: '2023-08-10'
    }
  ]);

  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    zoneCode: '',
    category: 'Use'
  });

  const categories = ['Use', 'Height', 'Density', 'Parking', 'Setbacks', 'Zoning Districts', 'Permits', 'Compliance', 'Other'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData(faq);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      zoneCode: '',
      category: 'Use'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFAQ(null);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (field: keyof FAQ, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setIsDropdownOpen(false);
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.zoneCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'rgb(3 7 18 / var(--tw-bg-opacity, 1))' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Zoning FAQs</h1>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New FAQ
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* FAQ Table */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
          </div>
          
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Question</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Zone Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Updated</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredFAQs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 text-sm text-white max-w-md">
                    <div className="truncate">{faq.question}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{faq.zoneCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{faq.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{faq.lastUpdated}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(faq)}
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
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
                </h2>
                <p className="text-gray-400 mt-1">
                  {editingFAQ 
                    ? 'Make changes to the existing FAQ.' 
                    : 'Add a new frequently asked question to the system.'}
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Question Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Question</label>
                <input
                  type="text"
                  value={formData.question || ''}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="What can I build in a C5-3 zone?"
                />
              </div>

              {/* Answer Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Answer</label>
                <textarea
                  value={formData.answer || ''}
                  onChange={(e) => handleInputChange('answer', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Provide a detailed answer to the question..."
                />
              </div>

              {/* Zone Code and Category */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Zone Code</label>
                  <input
                    type="text"
                    value={formData.zoneCode || ''}
                    onChange={(e) => handleInputChange('zoneCode', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="C5-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between"
                    >
                      <span>{formData.category || 'Use'}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-20 overflow-y-auto">
                        {categories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => handleCategorySelect(category)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              formData.category === category 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-gray-300'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                Save FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 