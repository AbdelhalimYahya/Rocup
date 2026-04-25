import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [numMembers, setNumMembers] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleMemberChange = (e) => {
    setNumMembers(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData(e.target);
      const members = [];
      const count = parseInt(numMembers, 10);
      if (count > 1) {
        for (let i = 1; i < count; i++) {
          members.push({
            name: formData.get(`member_${i}_name`),
            phone: formData.get(`member_${i}_phone`),
            national_id: formData.get(`member_${i}_national_id`),
            email: formData.get(`member_${i}_email`),
          });
        }
      }
      formData.set('members', JSON.stringify(members));

      // Append to the actual API
      await axios.post('https://api.swiftly-app.cloud/api/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      e.target.reset();
      setNumMembers("");
    } catch (err) {
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            RoCup Registration
          </h1>
          <p className="text-slate-400 text-lg">Welcome to our humble Team. We hope you enjoy our company</p>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 rounded-xl text-center shadow-lg">
            Application submitted successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl text-center shadow-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Info */}
          <div className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">1</span>
              Team Info
            </h2>
            <div className="space-y-5">
              <input type="text" name="team_name" placeholder="Team Name" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
              
              <div className="relative">
                <select name="num_members" value={numMembers} onChange={handleMemberChange} required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none">
                  <option value="" disabled>Number of Members</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <input type="text" name="department" placeholder="Department" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
            </div>
          </div>

          {/* Team Leader */}
          <div className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">2</span>
              Team Leader
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input type="text" name="leader_name" placeholder="Name" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
              <input type="text" name="leader_phone" placeholder="Phone Number" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
              <input type="text" name="leader_national_id" placeholder="National ID" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
              <input type="email" name="leader_email" placeholder="Email" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
            </div>
          </div>

          {/* Dynamic Members */}
          {numMembers && parseInt(numMembers, 10) > 1 && (
            <div className="space-y-6">
              {Array.from({ length: parseInt(numMembers, 10) - 1 }).map((_, idx) => (
                <div key={idx} className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-700/50">
                  <h2 className="text-2xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">{idx + 3}</span>
                    Member {idx + 1}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" name={`member_${idx + 1}_name`} placeholder="Name" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500" />
                    <input type="text" name={`member_${idx + 1}_phone`} placeholder="Phone Number" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500" />
                    <input type="text" name={`member_${idx + 1}_national_id`} placeholder="National ID" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500" />
                    <input type="email" name={`member_${idx + 1}_email`} placeholder="Email" required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Receipt */}
          <div className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">★</span>
              Upload Payment Receipt (150 EGP) on this number 01033626931 (Ahmed Damarany)
            </h2>
            <div className="relative">
              <input type="file" name="receipt" required className="block w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 file:transition-colors cursor-pointer border border-slate-700 rounded-2xl p-2 bg-slate-900/50" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold py-5 px-8 rounded-2xl shadow-xl shadow-emerald-500/20 transform transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed text-lg">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
