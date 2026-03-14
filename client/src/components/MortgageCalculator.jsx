import { useState } from "react";
import { Calculator, IndianRupee } from "lucide-react";
import { formatPrice } from "../lib/utils";

export default function MortgageCalculator({ price = 5000000 }) {
  const [loanAmount, setLoanAmount] = useState(Math.round(price * 0.8));
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const monthlyRate = rate / 100 / 12;
  const months = tenure * 12;
  const emi =
    monthlyRate === 0
      ? loanAmount / months
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanAmount;

  const principalPct = Math.round((loanAmount / totalPayment) * 100);
  const interestPct = 100 - principalPct;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator size={20} className="text-blue-600" />
        <h3 className="font-semibold text-slate-900">EMI Calculator</h3>
      </div>

      <div className="space-y-5">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Loan Amount</label>
            <span className="text-sm font-bold text-blue-600">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(loanAmount)}
            </span>
          </div>
          <input
            type="range"
            min={100000}
            max={price * 1.2}
            step={50000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>₹1L</span>
            <span>₹{Math.round(price * 1.2 / 100000)}L</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Interest Rate (p.a.)</label>
            <span className="text-sm font-bold text-blue-600">{rate}%</span>
          </div>
          <input
            type="range" min={5} max={18} step={0.1} value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5%</span><span>18%</span></div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Loan Tenure</label>
            <span className="text-sm font-bold text-blue-600">{tenure} years</span>
          </div>
          <input
            type="range" min={1} max={30} step={1} value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1yr</span><span>30yrs</span></div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
        <p className="text-blue-100 text-sm mb-1">Monthly EMI</p>
        <p className="text-4xl font-extrabold">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(emi)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Payment</p>
          <p className="font-bold text-slate-900 text-sm">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalPayment)}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Interest</p>
          <p className="font-bold text-red-600 text-sm">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalInterest)}
          </p>
        </div>
      </div>

      {/* Visual bar */}
      <div>
        <div className="flex rounded-full overflow-hidden h-3">
          <div className="bg-blue-500 transition-all" style={{ width: `${principalPct}%` }} />
          <div className="bg-red-400 transition-all" style={{ width: `${interestPct}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Principal ({principalPct}%)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Interest ({interestPct}%)</span>
        </div>
      </div>
    </div>
  );
}
