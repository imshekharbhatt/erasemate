import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getUsage, type UsageInfo } from '../lib/api'
import { useToastStore } from '../store'
import { Link } from 'react-router-dom'

function StatCard({ label, value, sub, color = 'purple' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const ring = color === 'green' ? 'bg-green-50 text-green-600' : color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-purple-light text-purple'
  return (
    <div className="bg-white border border-line rounded-xl p-5 flex flex-col gap-1">
      <span className={`text-[11px] font-bold tracking-[0.07em] uppercase px-2 py-0.5 rounded-full self-start ${ring}`}>{label}</span>
      <span className="text-[28px] font-extrabold text-text tracking-[-1px] mt-2">{value}</span>
      {sub && <span className="text-[12px] text-muted">{sub}</span>}
    </div>
  )
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-400' : 'bg-purple'
  return (
    <div className="w-full bg-line rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

const QUICK_ACTIONS = [
  { icon: '🖼️', label: 'Remove Background', desc: 'Upload a new image', href: '/#upload-section' },
  { icon: '⚙️', label: 'Settings', desc: 'Manage your account', href: '/settings' },
  { icon: '📖', label: 'API Docs', desc: 'Integrate with your app', href: 'https://meshekharbhatt-erasemate.hf.space/docs', external: true },
  { icon: '💎', label: 'Upgrade Plan', desc: 'Get unlimited processing', href: '/pricing' },
]

const TIPS = [
  'Use "Portrait & People" model for best results with human photos.',
  'Enable "Enhance edges" for images with hair or fur.',
  'Paste images directly with Ctrl+V on the home page.',
  'Higher resolution images give cleaner cutouts.',
  'Download as PNG to keep the transparent background.',
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { addToast } = useToastStore()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])

  const plan = (user?.user_metadata as any)?.plan || 'free'
  const name = (user?.user_metadata as any)?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const initials = ((user?.user_metadata as any)?.full_name || user?.email || 'U')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    getUsage()
      .then(setUsage)
      .catch(() => addToast('Could not load usage data', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const remaining = usage?.remaining ?? (usage?.limit === -1 ? Infinity : 0)
  const todayCount = usage?.today_count ?? 0
  const limit = usage?.limit ?? 5

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple flex items-center justify-center text-white text-[16px] font-bold shrink-0">
              {(user?.user_metadata as any)?.avatar_url
                ? <img src={(user?.user_metadata as any).avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                : initials}
            </div>
            <div>
              <h1 className="text-[22px] sm:text-[26px] font-extrabold text-text tracking-tight">
                Welcome back, {name} 
              </h1>
              <p className="text-[13px] text-muted mt-0.5">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-purple text-white px-5 py-2.5 rounded-lg text-[13.5px] font-semibold no-underline hover:bg-purple-hover transition-colors self-start sm:self-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 stroke-white">
              <path d="M12 5v14M5 12l7-7 7 7"/>
            </svg>
            New Image
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="Today"
            value={loading ? '…' : todayCount}
            sub="images processed"
          />
          <StatCard
            label="Remaining"
            value={loading ? '…' : limit === -1 ? '∞' : remaining}
            sub={limit === -1 ? 'unlimited' : `of ${limit} today`}
            color={remaining === 0 ? 'orange' : 'green'}
          />
          <StatCard
            label="Plan"
            value={plan.charAt(0).toUpperCase() + plan.slice(1)}
            sub={plan === 'free' ? '5 images/day' : 'Unlimited'}
            color={plan === 'free' ? 'purple' : 'green'}
          />
          <StatCard
            label="Storage"
            value="Supabase"
            sub="Results saved to cloud"
            color="purple"
          />
        </div>

        {/* Usage bar (free plan only) */}
        {plan === 'free' && !loading && (
          <div className="bg-white border border-line rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[14px] font-bold text-text">Daily usage</span>
                <span className="text-[12px] text-muted ml-2">{todayCount} / {limit} images used today</span>
              </div>
              <Link to="/pricing" className="text-[12px] font-semibold text-purple hover:underline no-underline">
                Upgrade →
              </Link>
            </div>
            <UsageBar used={todayCount} limit={limit} />
            {remaining === 0 && (
              <p className="text-[12px] text-orange-600 mt-2 font-medium">
                You've reached your daily limit. Resets at midnight UTC.
              </p>
            )}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Quick actions */}
          <div className="lg:col-span-2">
            <h2 className="text-[15px] font-bold text-text mb-3">Quick actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((a) => (
                a.external
                  ? <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer"
                      className="bg-white border border-line rounded-xl p-4 flex items-center gap-4 no-underline hover:border-purple hover:shadow-[0_4px_16px_rgba(91,63,248,0.1)] transition-all group">
                      <span className="text-[22px]">{a.icon}</span>
                      <div>
                        <p className="text-[13.5px] font-bold text-text group-hover:text-purple transition-colors">{a.label}</p>
                        <p className="text-[12px] text-muted">{a.desc}</p>
                      </div>
                    </a>
                  : <Link key={a.label} to={a.href}
                      className="bg-white border border-line rounded-xl p-4 flex items-center gap-4 no-underline hover:border-purple hover:shadow-[0_4px_16px_rgba(91,63,248,0.1)] transition-all group">
                      <span className="text-[22px]">{a.icon}</span>
                      <div>
                        <p className="text-[13.5px] font-bold text-text group-hover:text-purple transition-colors">{a.label}</p>
                        <p className="text-[12px] text-muted">{a.desc}</p>
                      </div>
                    </Link>
              ))}
            </div>

            {/* API info */}
            <div className="mt-4 bg-text rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-bold text-white">API Endpoint</span>
                <span className="text-[11px] text-[#6b7280] font-mono">v1.4.0</span>
              </div>
              <code className="text-[12px] text-[#a78bfa] font-mono break-all">
                https://meshekharbhatt-erasemate.hf.space/api/remove-background
              </code>
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                <a href="https://meshekharbhatt-erasemate.hf.space/docs" target="_blank" rel="noopener noreferrer"
                  className="text-[12px] font-semibold text-white/70 hover:text-white transition-colors no-underline">
                  View docs →
                </a>
                <span className="text-white/20">·</span>
                <a href="https://meshekharbhatt-erasemate.hf.space/redoc" target="_blank" rel="noopener noreferrer"
                  className="text-[12px] font-semibold text-white/70 hover:text-white transition-colors no-underline">
                  ReDoc →
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Account summary */}
            <div className="bg-white border border-line rounded-xl p-5">
              <h3 className="text-[14px] font-bold text-text mb-4">Account</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-muted">Email</span>
                  <span className="text-[12.5px] font-medium text-text truncate max-w-[150px]">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-muted">Plan</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${plan === 'free' ? 'bg-purple-light text-purple' : 'bg-green-100 text-green-700'}`}>
                    {plan.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-muted">Status</span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Active
                  </span>
                </div>
              </div>
              <Link to="/settings" className="block mt-4 text-center text-[13px] font-semibold text-purple border border-purple/20 bg-purple-light rounded-lg py-2 no-underline hover:bg-[#ddd6fe] transition-colors">
                Manage account →
              </Link>
            </div>

            {/* Tip of the day */}
            <div className="bg-purple-light border border-purple/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[16px]">💡</span>
                <span className="text-[12px] font-bold tracking-[0.06em] uppercase text-purple">Tip</span>
              </div>
              <p className="text-[13px] text-text2 leading-relaxed">{tip}</p>
            </div>

            {/* Upgrade CTA (free plan) */}
            {plan === 'free' && (
              <div className="bg-text rounded-xl p-5 text-center">
                <p className="text-[14px] font-bold text-white mb-1">Need more?</p>
                <p className="text-[12px] text-[#9ca3af] mb-4">Upgrade for unlimited daily processing and priority support.</p>
                <Link to="/pricing" className="block bg-white text-text text-[13px] font-bold py-2.5 rounded-lg no-underline hover:opacity-90 transition-opacity">
                  View plans →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
