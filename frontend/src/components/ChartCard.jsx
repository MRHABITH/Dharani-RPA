import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, LineChart, Line, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl px-3 py-2.5 text-xs shadow-2xl">
      <p className="text-slate-400 font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-black">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function ChartCard({ tasks }) {
  const statusData = [
    { name: 'Running',   value: tasks.filter(t => ['STARTED','RUNNING'].includes(t.status)).length,    fill: '#6366f1' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length,                    fill: '#10b981' },
    { name: 'Failed',    value: tasks.filter(t => ['FAILED','ERROR'].includes(t.status)).length,       fill: '#f43f5e' },
    { name: 'Stopped',   value: tasks.filter(t => t.status === 'STOPPED').length,                     fill: '#f59e0b' },
    { name: 'Loop Sent', value: tasks.filter(t => t.mode === 'loop').reduce((s,t) => s+(t.send_count||0),0), fill: '#22d3ee' },
  ];

  if (tasks.length === 0) {
    return (
      <div className="h-[260px] flex flex-col items-center justify-center text-slate-700 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-[12px] font-bold uppercase tracking-wider">No data yet</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={statusData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
          <defs>
            {statusData.map((d, i) => (
              <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={d.fill} stopOpacity={0.9} />
                <stop offset="100%" stopColor={d.fill} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(148,163,184,0.3)"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="rgba(148,163,184,0.2)"
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={44}>
            {statusData.map((_, i) => (
              <Cell key={i} fill={`url(#grad${i})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}