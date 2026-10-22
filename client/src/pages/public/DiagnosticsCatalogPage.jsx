import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Search, 
  Clock, 
  Home, 
  Building2, 
  Info, 
  AlertCircle, 
  ArrowRight,
  Loader2 
} from 'lucide-react';
import { diagnosticService } from '../../services/diagnosticService';
import { useAuth } from '../../hooks/useAuth';
import { useJourney } from '../../hooks/useJourney';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { MockPaymentModal } from '../../components/payment/MockPaymentModal';

const CATEGORIES = ['All', 'Hematology', 'Biochemistry', 'Radiology', 'Microbiology', 'Pathology'];

export const DiagnosticsCatalogPage = () => {
  const { user, isPatient } = useAuth();
  const { refreshActiveJourney, refreshAllJourneys } = useJourney();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Booking Modal State
  const [selectedTest, setSelectedTest] = useState(null);
  const [collectionType, setCollectionType] = useState('lab_visit');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('08:00-09:00');
  const [street, setStreet] = useState(user?.address?.street || '14 Anna Nagar');
  const [city, setCity] = useState(user?.address?.city || 'Chennai');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Mock Payment Trigger
  const [paymentModalData, setPaymentModalData] = useState(null);

  useEffect(() => {
    fetchTests();
  }, [selectedCategory]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await diagnosticService.getAllTests({
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      if (res.success) {
        setTests(res.data);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (test) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/diagnostics' } } });
      return;
    }
    if (!isPatient) {
      alert('Only registered patients can order diagnostic laboratory tests.');
      return;
    }

    setSelectedTest(test);
    setCollectionType(test.isHomeSampleAvailable ? 'home_collection' : 'lab_visit');
    setBookingError('');
  };

  const handleConfirmTestHold = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);
    setBookingError('');

    try {
      const res = await diagnosticService.bookTest({
        testId: selectedTest._id,
        bookingDate,
        timeSlot,
        collectionType,
        collectionAddress: collectionType === 'home_collection' ? { street, city } : undefined
      });

      if (res.success) {
        const booking = res.data.booking;
        const testName = selectedTest.testName;
        setSelectedTest(null);

        // Open Mock Payment Modal
        setPaymentModalData({
          referenceType: 'TestBooking',
          referenceId: booking._id,
          title: `Diagnostic Lab: ${testName}`,
          amount: selectedTest.price
        });
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to book test');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    const nameMatch = t.testName?.toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = t.testCode?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || codeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Test Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Certified pathology, hematology, and imaging investigations with online digital report delivery
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search test name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      {loading ? (
        <Loader message="Loading certified test catalog..." />
      ) : filteredTests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No tests match your criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between p-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {test.testCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{test.testName}</h3>
                  </div>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{test.price}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {test.description}
                </p>

                {/* Instructions Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                  <div className="flex items-start space-x-1.5 text-slate-700">
                    <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Preparation:</strong> {test.preparationInstructions}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Sample: <strong className="text-slate-700">{test.sampleType}</strong></span>
                    <span>Turnaround: <strong className="text-slate-700">{test.turnaroundHours} Hours</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  {test.isHomeSampleAvailable ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      <Home className="w-3 h-3" />
                      <span>Home Collection Available</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      <Building2 className="w-3 h-3" />
                      <span>Lab Visit Only</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenBooking(test)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <span>Schedule Test Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Booking Modal */}
      {selectedTest && (
        <Modal
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          title={`Schedule Test: ${selectedTest.testName}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleConfirmTestHold} className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Collection Mode Radio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Specimen Collection Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-2 text-xs font-semibold ${
                  collectionType === 'lab_visit'
                    ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-100'
                    : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="collectionType"
                    value="lab_visit"
                    checked={collectionType === 'lab_visit'}
                    onChange={() => setCollectionType('lab_visit')}
                    className="sr-only"
                  />
                  <Building2 className="w-4 h-4" />
                  <span>Hospital Lab Visit</span>
                </label>

                <label className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                  !selectedTest.isHomeSampleAvailable
                    ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                    : collectionType === 'home_collection'
                    ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-100 cursor-pointer'
                    : 'border-slate-200 text-slate-600 cursor-pointer'
                }`}>
                  <input
                    type="radio"
                    name="collectionType"
                    value="home_collection"
                    disabled={!selectedTest.isHomeSampleAvailable}
                    checked={collectionType === 'home_collection'}
                    onChange={() => setCollectionType('home_collection')}
                    className="sr-only"
                  />
                  <Home className="w-4 h-4" />
                  <span>Home Phlebotomy</span>
                </label>
              </div>
            </div>

            {/* Address fields if Home Collection */}
            {collectionType === 'home_collection' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-slate-700 uppercase">Field Phlebotomist Dispatch Address</p>
                <input
                  type="text"
                  required
                  placeholder="Street / House Number"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Collection Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="07:00-08:00">07:00 - 08:00 (Fasting)</option>
                  <option value="08:00-09:00">08:00 - 09:00 (Morning)</option>
                  <option value="09:00-10:00">09:00 - 10:00 (Morning)</option>
                  <option value="11:00-12:00">11:00 - 12:00 (Noon)</option>
                  <option value="14:00-15:00">14:00 - 15:00 (Post-Lunch)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Test Fee:</span>
              <span className="text-base font-extrabold text-amber-800">₹{selectedTest.price}</span>
            </div>

            <button
              type="submit"
              disabled={submittingBooking}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              {submittingBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving Test Slot...</span>
                </>
              ) : (
                <>
                  <span>Confirm Test Hold & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </Modal>
      )}

      {/* Mock Payment Modal */}
      {paymentModalData && (
        <MockPaymentModal
          isOpen={!!paymentModalData}
          bookingDetails={paymentModalData}
          onClose={() => setPaymentModalData(null)}
          onPaymentSuccess={() => {
            refreshActiveJourney();
            refreshAllJourneys();
            navigate('/patient/dashboard');
          }}
        />
      )}
    </div>
  );
};
