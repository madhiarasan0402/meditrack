import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useJourney } from '../../hooks/useJourney';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';

export const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const { refreshActiveJourney, refreshAllJourneys } = useJourney();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getPatientReports();
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      setDownloadingId(report._id);
      await reportService.downloadReport(report._id, report.originalFileName);
      // Reload reports to update Viewed status
      await loadReports();
      refreshActiveJourney();
      refreshAllJourneys();
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Laboratory Information System</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Digital Diagnostic Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Secure, authenticated PDF reports directly verified by hospital pathologists
        </p>
      </div>

      {loading ? (
        <Loader message="Accessing encrypted report vault..." />
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No diagnostic reports available</h3>
          <p className="text-xs text-slate-500 mt-1">
            When your laboratory specimen analysis completes, your certified report will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Test Name</th>
                  <th className="py-4 px-6">Published Date</th>
                  <th className="py-4 px-6">Clinical Remarks</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{report.testName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{report.originalFileName}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()} &bull; {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-600">
                      {report.clinicalRemarks || 'Normal parameters observed.'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge status={report.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report._id}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === report._id ? 'Opening...' : 'Download PDF'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
