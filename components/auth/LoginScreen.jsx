import React from "react";
import { Wrench, KeyRound, UserCheck } from "lucide-react";

export default function LoginScreen({ loginInput, setLoginInput, onSubmit }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-700">
        <div className="bg-slate-950 text-white p-6 text-center border-b border-slate-800">
          <div className="inline-flex bg-blue-600 p-3 rounded-xl text-white mb-2 shadow">
            <Wrench className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black">AutoFix Pro</h1>

          <p className="text-xs text-slate-400 mt-1">
            Multi-User Authentication Portal
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              Username
            </label>

            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

              <input
                type="text"
                required
                placeholder="Enter your username"
                value={loginInput.username}
                onChange={(e) =>
                  setLoginInput({
                    ...loginInput,
                    username: e.target.value,
                  })
                }
                className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              PIN / Password
            </label>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

              <input
                type="password"
                required
                placeholder="Enter your PIN"
                value={loginInput.pin}
                onChange={(e) =>
                  setLoginInput({
                    ...loginInput,
                    pin: e.target.value,
                  })
                }
                className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow transition-all"
          >
            Sign In to Workshop
          </button>
        </form>
      </div>
    </div>
  );
}
