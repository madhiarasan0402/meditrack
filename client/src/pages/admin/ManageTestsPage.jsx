import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { diagnosticService } from '../../services/diagnosticService';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';

const CATEGORIES = ['Hematology', 'Biochemistry', 'Radiology', 'Microbiology', 'Pathology'];

export const ManageTestsPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);

  const [formData, setFormData] = useState({
    testName: '',
    testCode: '',
    category: 'Biochemistry',
    description: '',
    price: 500,
    preparationInstructions: 'No special preparation needed.',
    turnaroundHours: 24,
    sampleType: 'Blood',
    isHomeSampleAvailable: true
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const res = await diagnosticService.getAllTests();
      if (res.success) {
        setTests(res.data);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTestId(null);
    setFormData({
      testName: '',
      testCode: '',
      category: 'Biochemistry',
      description: '',
      price: 500,
      preparationInstructions: 'No special preparation needed.',
      turnaroundHours: 24,
      sampleType: 'Blood',
      isHomeSampleAvailable: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test) => {
    setEditingTestId(test._id);
    setFormData({
      testName: test.testName,
      testCode: test.testCode,
      category: test.category,
      description: test.description,
      price: test.price,
      preparationInstructions: test.preparationInstructions,
      turnaroundHours: test.turnaroundHours,
      sampleType: test.sampleType,
      isHomeSampleAvailable: test.isHomeSampleAvailable
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestId) {
        await diagnosticService.updateTest(editingTestId, formData);
      } else {
        await diagnosticService.createTest(formData);
      }
      setIsModalOpen(false);
      await loadTests();
    } catch (err) {
      alert('Error saving test: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this diagnostic test from public catalog?')) return;
    try {
      await diagnosticService.deleteTest(id);
      await loadTests();
    } catch (err) {
      alert('Failed to archive: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Diagnostic Directory Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Test Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage authorized clinical laboratory procedures, sample guidelines, and price schedules
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Diagnostic Test</span>
        </button>
      </div>

      {loading ? (
        <Loader message="Loading diagnostic catalog..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Test Code</th>
                  <th className="py-4 px-6">Test Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Sample Type</th>
                  <th className="py-4 px-6">Price (INR)</th>
                  <th className="py-4 px-6">Turnaround</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tests.map((test) => (
                  <tr key={test._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-mono font-bold text-amber-800">{test.testCode}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{test.testName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {test.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">{test.sampleType}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">₹{test.price}</td>
                    <td className="py-4 px-6">{test.turnaroundHours} Hours</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenEdit(test)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(test._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Form Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTestId ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Test Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  placeholder="e.g. Lipid Profile"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Test Code (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={formData.testCode}
                  onChange={(e) => setFormData({ ...formData, testCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. LIP-202"
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Fee (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Turnaround (Hrs)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.turnaroundHours}
                  onChange={(e) => setFormData({ ...formData, turnaroundHours: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Description & Clinical Utility
              </label>
              <textarea
                rows={2}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Preparation Instructions for Patient
              </label>
              <input
                type="text"
                value={formData.preparationInstructions}
                onChange={(e) => setFormData({ ...formData, preparationInstructions: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="homeSample"
                checked={formData.isHomeSampleAvailable}
                onChange={(e) => setFormData({ ...formData, isHomeSampleAvailable: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="homeSample" className="text-xs text-slate-700 font-semibold cursor-pointer">
                Available for Home Phlebotomy Sample Collection
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Diagnostic Test</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
