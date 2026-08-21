import React from "react";
import { KeyRound, UserCheck } from "lucide-react";

export default function LoginScreen({ loginInput, setLoginInput, onSubmit }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-700">
        {/* GARAGE ALTALAA FAKHIR LOGO */}
        <div className="bg-white flex items-center justify-center h-[270px] border-b border-slate-300">
          <img
            src="/images/garage-logo.png"
            alt="Garage Altalaa Fakhir"
            className="max-w-[400px] w-[78%] h-auto object-contain"
          />
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={onSubmit} className="px-8 py-7 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-base font-black text-slate-700 mb-2">
              Username
            </label>

            <div className="relative">
              <UserCheck className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />

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
                className="w-full pl-12 pr-4 py-4 text-base font-bold text-slate-900 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* PIN / Password */}
          <div>
            <label className="block text-base font-black text-slate-700 mb-2">
              PIN / Password
            </label>

            <div className="relative">
              <KeyRound className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />

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
                className="w-full pl-12 pr-4 py-4 text-base font-bold text-slate-900 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base uppercase tracking-wider rounded-xl shadow-lg transition-all"
          >
            Sign In to Workshop
          </button>
        </form>
      </div>
    </div>
  );
}
