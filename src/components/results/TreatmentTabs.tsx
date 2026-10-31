import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Shield,
  Sprout,
  AlertTriangle,
  CloudSun,
  TrendingDown,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ActionItem {
  title: string;
  detail: string;
  type: 'cultural' | 'mechanical' | 'biological' | 'organic' | 'chemical';
  priority: number;
  safetyNote?: string;
}

interface TreatmentPlanData {
  immediate: ActionItem[];
  shortTerm: ActionItem[];
  seasonLong: ActionItem[];
  prevention: ActionItem[];
  monitoring: {
    rescanInDays: number;
    watchFor: string[];
  };
  escalation: string[];
  yieldRiskIfUntreated: {
    level: 'low' | 'medium' | 'high';
    reason: string;
  };
  weatherTip: string;
  disclaimer: string;
}

interface TreatmentTabsProps {
  plan: TreatmentPlanData;
}

const ACTION_TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  cultural: { label: 'Cultural Practice', bg: 'bg-leaf-100', text: 'text-leaf-800' },
  mechanical: { label: 'Mechanical / Physical', bg: 'bg-cream-200', text: 'text-soil-800' },
  biological: { label: 'Biological Control', bg: 'bg-sage-200', text: 'text-leaf-900' },
  organic: { label: 'Organic Treatment', bg: 'bg-leaf-200', text: 'text-leaf-800 font-medium' },
  chemical: { label: 'Chemical (Last Resort)', bg: 'bg-rust-100', text: 'text-rust-700 font-semibold' },
};

export const TreatmentTabs: React.FC<TreatmentTabsProps> = ({ plan }) => {
  const [activeTab, setActiveTab] = useState<'immediate' | 'shortTerm' | 'seasonLong' | 'prevention'>('immediate');

  const tabs = [
    { id: 'immediate', label: 'Immediate (0–48 h)', icon: Clock, count: plan?.immediate?.length || 0 },
    { id: 'shortTerm', label: 'Short-term (3–14 d)', icon: Calendar, count: plan?.shortTerm?.length || 0 },
    { id: 'seasonLong', label: 'Season-long', icon: Sprout, count: plan?.seasonLong?.length || 0 },
    { id: 'prevention', label: 'Prevention & Vigor', icon: Shield, count: plan?.prevention?.length || 0 },
  ];

  const currentActions: ActionItem[] = plan ? plan[activeTab] || [] : [];

  return (
    <div className="space-y-6">
      {/* Risk and Weather Context Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Yield Risk */}
        {plan.yieldRiskIfUntreated && (
          <div className="p-3.5 rounded-xl bg-cream-100 border border-soil-600/15 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rust-100 text-rust-700 shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold text-soil-900">
                  Untreated Yield Risk:
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${
                    plan.yieldRiskIfUntreated.level === 'high'
                      ? 'bg-rust-500 text-cream-50'
                      : plan.yieldRiskIfUntreated.level === 'medium'
                      ? 'bg-ochre-500 text-cream-50'
                      : 'bg-leaf-500 text-cream-50'
                  }`}
                >
                  {plan.yieldRiskIfUntreated.level}
                </span>
              </div>
              <p className="text-xs text-soil-600 leading-relaxed">
                {plan.yieldRiskIfUntreated.reason}
              </p>
            </div>
          </div>
        )}

        {/* Weather Tip */}
        {plan.weatherTip && (
          <div className="p-3.5 rounded-xl bg-cream-100 border border-soil-600/15 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-wheat-100 text-soil-800 shrink-0">
              <CloudSun className="w-4 h-4 text-ochre-600" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-serif font-bold text-soil-900">
                Weather-Sensitive Advisory:
              </span>
              <p className="text-xs text-soil-600 leading-relaxed">{plan.weatherTip}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Plan Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-cream-200/70 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-soil-950 text-cream-50 shadow-sm'
                  : 'text-soil-700 hover:text-soil-950 hover:bg-cream-100/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-cream-50 text-soil-950 font-bold' : 'bg-cream-100 text-soil-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {currentActions.length === 0 ? (
          <div className="p-6 text-center text-xs text-soil-500 bg-cream-50 rounded-xl border border-soil-600/10">
            No specific actions required in this phase.
          </div>
        ) : (
          currentActions.map((action, idx) => {
            const typeStyle = ACTION_TYPE_STYLES[action.type] || ACTION_TYPE_STYLES.cultural;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-cream-50 border border-soil-600/15 warm-shadow-sm space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cream-200 text-soil-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {action.priority || idx + 1}
                    </span>
                    <h5 className="font-serif text-sm font-semibold text-soil-900">
                      {action.title}
                    </h5>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-medium ${typeStyle.bg} ${typeStyle.text}`}
                  >
                    {typeStyle.label}
                  </span>
                </div>

                <p className="text-xs text-soil-700 leading-relaxed pl-7">
                  {action.detail}
                </p>

                {/* Safety / PPE note for chemical options */}
                {action.type === 'chemical' && action.safetyNote && (
                  <div className="ml-7 mt-2 p-2.5 rounded-lg bg-rust-50 border border-rust-500/30 text-[11px] text-rust-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rust-600" />
                      <span>Chemical Stewardship & PPE Safety Warning:</span>
                    </div>
                    <p className="leading-relaxed">{action.safetyNote}</p>
                    <p className="text-[10px] text-rust-600 italic">
                      Adhere strictly to product label instructions and local pre-harvest intervals. Always consult your agriculture extension officer.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Monitoring & Escalation Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Monitoring Schedule */}
        {plan.monitoring && (
          <div className="p-4 rounded-xl bg-cream-100 border border-soil-600/15 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-leaf-700" />
              <h5 className="font-serif text-xs font-bold text-soil-900">
                Rescan & Monitoring Schedule
              </h5>
            </div>
            <p className="text-xs text-soil-700">
              Re-scan this field in{' '}
              <strong className="text-soil-900 font-semibold font-serif">
                {plan.monitoring.rescanInDays} days
              </strong>{' '}
              to track visual pathology progression.
            </p>
            {plan.monitoring.watchFor && plan.monitoring.watchFor.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-medium text-soil-600">Symptoms to watch for:</span>
                <ul className="text-xs text-soil-700 list-disc list-inside space-y-0.5">
                  {plan.monitoring.watchFor.map((w, wIdx) => (
                    <li key={wIdx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Escalation Rules */}
        {plan.escalation && plan.escalation.length > 0 && (
          <div className="p-4 rounded-xl bg-ochre-500/10 border border-ochre-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-ochre-600" />
              <h5 className="font-serif text-xs font-bold text-soil-900">
                When to Contact an Extension Officer
              </h5>
            </div>
            <ul className="text-xs text-soil-800 list-disc list-inside space-y-1">
              {plan.escalation.map((eItem, eIdx) => (
                <li key={eIdx}>{eItem}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
