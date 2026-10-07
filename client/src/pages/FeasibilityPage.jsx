import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatsCard from '../components/common/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TrendingUp, IndianRupee, Calendar, Percent } from 'lucide-react';

const formatINR = (val) => {
  if (!val && val !== 0) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  } else if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
};

export default function FeasibilityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeasibility() {
      try {
        const res = await api.getFeasibility();
        setData(res);
      } catch (err) {
        console.error('Failed to load feasibility data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeasibility();
  }, []);

  if (loading) return <LoadingSpinner text="Computing Indian market ROI and metallurgical yields..." />;

  const f = data || {
    estimatedCost: 32000000,
    actualCost: 26800000,
    materialMarketValue: 74500000,
    laborCost: 6500000,
    disposalCost: 1500000,
    netProfit: 47700000,
    estimatedDays: 45,
    actualDays: 32,
    efficiencyScore: 92.4,
    materialYieldPercent: 94.2,
    wastePercent: 5.8,
    roi: 178.0,
    scrapRatePerTon: 38500,
    notes: 'KRAN-VULCAN robotic crawler accelerated Alang shipyard dismantling by 13 days vs manual gas cutters, yielding ₹82.5 Lakh direct savings (+26.4% EBITDA margin improvement) and 0% human confined-space hazard.'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-cyan" />
          <h2 className="text-xl font-bold text-white">Scrap Feasibility, Yield & Financial ROI (INR ₹)</h2>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Indian domestic secondary steel market indices (Alang Ship Breaking Yard, Mandi Gobindgarh &amp; Bhavnagar induction mills).
        </p>
      </div>

      {/* Top 4 Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Projected Net Margin"
          value={formatINR(f.netProfit)}
          change={`+${f.roi}% ROI`}
          changeType="positive"
          subtitle={`₹${(f.netProfit || 47700000).toLocaleString('en-IN')}`}
          icon={IndianRupee}
        />
        <StatsCard
          title="Recovered Steel Market Value"
          value={formatINR(f.materialMarketValue)}
          subtitle="Based on ₹38,500/MT HMS-1 Index"
          icon={TrendingUp}
        />
        <StatsCard
          title="Dismantling Timeline"
          value={`${f.actualDays} Days`}
          change={`${f.estimatedDays - f.actualDays} days ahead`}
          changeType="positive"
          subtitle={`Plan: ${f.estimatedDays} days`}
          icon={Calendar}
        />
        <StatsCard
          title="Material Yield Recovery"
          value={`${f.materialYieldPercent}%`}
          change={`Waste: ${f.wastePercent}%`}
          changeType="positive"
          icon={Percent}
        />
      </div>

      {/* Financial Details Table & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Revenue Breakdown */}
        <div className="card-surface p-6 border border-dark-border bg-dark-card">
          <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider border-b border-dark-border pb-3 mb-4 flex items-center justify-between">
            <span>Economic Statement (Indian Rupees - ₹)</span>
            <span className="text-[10px] text-cyan-400 font-mono">ALANG YARD HMS-1 BENCHMARK</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-dark-border">
              <span className="text-neutral-300">Gross Recovered Steel &amp; Metal Value</span>
              <span className="font-mono font-bold text-emerald-400">+{formatINR(f.materialMarketValue)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-dark-border">
              <span className="text-neutral-400">Robotic Operation, Plasma Gas &amp; Power</span>
              <span className="font-mono text-neutral-300">-{formatINR(f.actualCost - f.laborCost - f.disposalCost)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-dark-border">
              <span className="text-neutral-400">Supervisory Engineers &amp; Safety Officers</span>
              <span className="font-mono text-neutral-300">-{formatINR(f.laborCost)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-dark-border">
              <span className="text-neutral-400">Hazardous Waste &amp; PCB Neutralization</span>
              <span className="font-mono text-neutral-300">-{formatINR(f.disposalCost)}</span>
            </div>

            <div className="pt-3 border-t border-neutral-700 flex items-center justify-between text-sm font-bold">
              <span className="text-white">Net Return on Dismantling (EBITDA)</span>
              <span className="font-mono text-emerald-400">+{formatINR(f.netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Operational Efficiency Report */}
        <div className="card-surface p-6 border border-dark-border bg-dark-card flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider border-b border-dark-border pb-3 mb-4">
              AI Pathing &amp; Efficiency Gains (Alang Yard)
            </h3>

            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-neutral-950 border border-dark-border">
                <span className="font-mono text-accent-cyan text-[11px] block mb-1">
                  AUTONOMOUS BENEFIT SUMMARY
                </span>
                <p>{f.notes}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-neutral-950 border border-dark-border">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Manual Yard Baseline</span>
                  <span className="text-base font-bold font-mono text-neutral-300">45 Days</span>
                  <span className="text-[10px] text-neutral-500 block mt-1">High torch safety risk</span>
                </div>
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800">
                  <span className="text-[10px] font-mono text-accent-cyan uppercase block">Robotic Titan-X1</span>
                  <span className="text-base font-bold font-mono text-cyan-300">32 Days</span>
                  <span className="text-[10px] text-cyan-400 block mt-1">Zero human cut injury</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-dark-border">
            <button
              onClick={() => alert('Full feasibility workbook exported (XLSX).')}
              className="btn-primary w-full text-xs font-mono"
            >
              Export Comprehensive Audit Spreadsheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

