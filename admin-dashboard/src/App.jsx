import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, FileSpreadsheet, Users, User, Download, RefreshCw, Eye } from 'lucide-react';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/applications');
      setApplications(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/${id}/status`, { status });
      fetchApplications();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => ({ ...prev, status }));
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleExportExcel = async () => {
    try {
      setImporting(true); // Reusing importing state for loading
      const res = await axios.get('http://localhost:5000/api/applications/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export data.");
    } finally {
      setImporting(false);
    }
  };

  const filteredApplications = applications.filter(app => filter === 'all' || app.status === filter);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50 shadow-xl backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              RoCup Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Manage applications and team registrations</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchApplications}
              className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-slate-300"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleExportExcel}
              disabled={importing} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-5 h-5" />
              {importing ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div 
            onClick={() => setFilter('all')}
            className={`cursor-pointer p-6 rounded-3xl border shadow-xl backdrop-blur-sm flex items-center gap-4 transition-all ${filter === 'all' ? 'bg-slate-700/80 border-blue-500/50 scale-105' : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700/50'}`}
          >
            <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Teams</p>
              <p className="text-3xl font-bold text-white">{applications.length}</p>
            </div>
          </div>

          <div 
            onClick={() => setFilter('approved')}
            className={`cursor-pointer p-6 rounded-3xl border shadow-xl backdrop-blur-sm flex items-center gap-4 transition-all ${filter === 'approved' ? 'bg-slate-700/80 border-emerald-500/50 scale-105' : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700/50'}`}
          >
            <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-white">{applications.filter(a => a.status === 'approved').length}</p>
            </div>
          </div>

          <div 
            onClick={() => setFilter('pending')}
            className={`cursor-pointer p-6 rounded-3xl border shadow-xl backdrop-blur-sm flex items-center gap-4 transition-all ${filter === 'pending' ? 'bg-slate-700/80 border-amber-500/50 scale-105' : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700/50'}`}
          >
            <div className="p-4 bg-amber-500/20 rounded-2xl text-amber-400">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-white">{applications.filter(a => a.status === 'pending').length}</p>
            </div>
          </div>

          <div 
            onClick={() => setFilter('rejected')}
            className={`cursor-pointer p-6 rounded-3xl border shadow-xl backdrop-blur-sm flex items-center gap-4 transition-all ${filter === 'rejected' ? 'bg-slate-700/80 border-red-500/50 scale-105' : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700/50'}`}
          >
            <div className="p-4 bg-red-500/20 rounded-2xl text-red-400">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-white">{applications.filter(a => a.status === 'rejected').length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/80 rounded-3xl border border-slate-700/50 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Team Name</th>
                  <th className="p-4 font-semibold">Leader</th>
                  <th className="p-4 font-semibold text-center">Members</th>
                  <th className="p-4 font-semibold">Department</th>
                  <th className="p-4 font-semibold text-center">Receipt</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">Loading applications...</td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">No applications found in this category.</td>
                  </tr>
                ) : (
                  filteredApplications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{app.team_name}</div>
                        <div className="text-xs text-slate-400 mt-1">{new Date(app.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{app.leader_name}</div>
                            <div className="text-xs text-slate-400">{app.leader_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                          {app.num_members}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {app.department || '-'}
                      </td>
                      <td className="p-4 text-center">
                        {app.receipt_url ? (
                          <a 
                            href={`http://localhost:5000${app.receipt_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" /> View
                          </a>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {app.status === 'approved' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20"><CheckCircle className="w-3 h-3"/> Approved</span>}
                        {app.status === 'rejected' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm border border-red-500/20"><XCircle className="w-3 h-3"/> Rejected</span>}
                        {app.status === 'pending' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm border border-amber-500/20"><Clock className="w-3 h-3"/> Pending</span>}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> Details
                        </button>
                        {app.status !== 'approved' && (
                          <button 
                            onClick={() => handleStatusChange(app.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors text-sm font-medium"
                          >
                            Approve
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button 
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Team Details: <span className="text-cyan-400">{selectedApp.team_name}</span>
              </h2>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              {/* Leader Details */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-slate-700 pb-2">Team Leader Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-400">Name</p>
                    <p className="text-white font-medium">{selectedApp.leader_name}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white font-medium">{selectedApp.leader_email}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white font-medium">{selectedApp.leader_phone}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-400">National ID</p>
                    <p className="text-white font-medium">{selectedApp.leader_national_id}</p>
                  </div>
                </div>
              </div>

              {/* Members Details */}
              {selectedApp.members && typeof selectedApp.members === 'string' ? JSON.parse(selectedApp.members).length > 0 : selectedApp.members?.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Additional Members</h3>
                  <div className="space-y-4">
                    {(typeof selectedApp.members === 'string' ? JSON.parse(selectedApp.members) : selectedApp.members).map((member, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <p className="text-cyan-400 font-medium mb-2">Member {idx + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><span className="text-slate-400 text-sm">Name:</span> <span className="text-white">{member.name}</span></div>
                          <div><span className="text-slate-400 text-sm">Email:</span> <span className="text-white">{member.email}</span></div>
                          <div><span className="text-slate-400 text-sm">Phone:</span> <span className="text-white">{member.phone}</span></div>
                          <div><span className="text-slate-400 text-sm">National ID:</span> <span className="text-white">{member.national_id}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Additional Members</h3>
                  <p className="text-slate-400">No additional members.</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 flex flex-wrap gap-6 items-center">
                <div>
                  <p className="text-sm text-slate-400">Department</p>
                  <p className="text-white font-medium">{selectedApp.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Members</p>
                  <p className="text-white font-medium">{selectedApp.num_members}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Submission Date</p>
                  <p className="text-white font-medium">{new Date(selectedApp.created_at).toLocaleString()}</p>
                </div>
                {selectedApp.receipt_url && (
                  <div>
                    <p className="text-sm text-slate-400">Receipt</p>
                    <a 
                      href={`http://localhost:5000${selectedApp.receipt_url}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Download className="w-4 h-4" /> View File
                    </a>
                  </div>
                )}
              </div>

            </div>

            <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-4">
               {selectedApp.status !== 'approved' && (
                  <button 
                    onClick={() => handleStatusChange(selectedApp.id, 'approved')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve
                  </button>
                )}
                {selectedApp.status !== 'rejected' && (
                  <button 
                    onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                    className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors font-medium flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
