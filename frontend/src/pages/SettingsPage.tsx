import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../store'

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-line">
        <h2 className="text-[15px] font-bold text-text">{title}</h2>
        {desc && <p className="text-[12.5px] text-muted mt-0.5">{desc}</p>}
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 py-3.5 border-b border-line last:border-0">
      <label className="text-[13px] font-semibold text-text2 sm:w-40 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-bg border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] text-text outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all placeholder:text-muted2"
    />
  )
}

function Btn({ children, loading, variant = 'primary', onClick, type = 'button', disabled }:
  { children: React.ReactNode; loading?: boolean; variant?: 'primary' | 'secondary' | 'danger'; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  const styles = {
    primary: 'bg-purple text-white hover:bg-purple-hover hover:shadow-[0_4px_14px_rgba(91,63,248,0.3)]',
    secondary: 'bg-bg text-text2 border border-line hover:bg-bg2',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all ${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { addToast } = useToastStore()

  const [name, setName] = useState((user?.user_metadata as any)?.full_name || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const plan = (user?.user_metadata as any)?.plan || 'free'
  const initials = (name || user?.email || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
      if (error) throw error
      addToast('Profile updated', 'success')
    } catch (e: any) {
      addToast(e.message || 'Failed to update profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPw || newPw !== confirmPw) {
      addToast('Passwords do not match', 'error')
      return
    }
    if (newPw.length < 8) {
      addToast('Password must be at least 8 characters', 'error')
      return
    }
    setSavingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      addToast('Password changed successfully', 'success')
    } catch (e: any) {
      addToast(e.message || 'Failed to change password', 'error')
    } finally {
      setSavingPw(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      addToast('Email does not match', 'error')
      return
    }
    setDeleting(true)
    try {
      // Sign out — actual deletion requires a server-side admin call
      await signOut()
      addToast('Account deletion requested. Please contact support to complete.', 'info')
    } catch {
      addToast('Something went wrong', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[24px] sm:text-[28px] font-extrabold text-text tracking-tight">Settings</h1>
          <p className="text-[14px] text-muted mt-1">Manage your account, security, and preferences.</p>
        </div>

        <div className="flex flex-col gap-4">

          {/* Profile */}
          <Section title="Profile" desc="Your public display name and account info.">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-purple flex items-center justify-center text-white text-[18px] font-bold shrink-0">
                {(user?.user_metadata as any)?.avatar_url
                  ? <img src={(user?.user_metadata as any).avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  : initials}
              </div>
              <div>
                <p className="text-[14px] font-bold text-text">{name || 'No name set'}</p>
                <p className="text-[12.5px] text-muted">{user?.email}</p>
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${plan === 'free' ? 'bg-purple-light text-purple' : 'bg-green-100 text-green-700'}`}>
                  {plan.toUpperCase()} PLAN
                </span>
              </div>
            </div>

            <Field label="Display name">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Email address">
              <Input value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-[11.5px] text-muted mt-1">Email cannot be changed here. Contact support.</p>
            </Field>

            <div className="mt-4 flex justify-end">
              <Btn loading={savingProfile} onClick={handleSaveProfile}>Save changes</Btn>
            </div>
          </Section>

          {/* Password */}
          <Section title="Password & Security" desc="Change your password. Leave blank to keep current.">
            <Field label="New password">
              <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 8 characters" />
            </Field>
            <Field label="Confirm password">
              <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
            </Field>

            {newPw && newPw !== confirmPw && (
              <p className="text-[12px] text-red-500 mt-2">Passwords don't match</p>
            )}

            <div className="mt-4 flex justify-end">
              <Btn loading={savingPw} onClick={handleChangePassword} disabled={!newPw || newPw !== confirmPw}>
                Update password
              </Btn>
            </div>
          </Section>

          {/* Plan */}
          <Section title="Plan & Billing" desc="Your current subscription and usage limits.">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-bold text-text capitalize">{plan} Plan</p>
                <p className="text-[12.5px] text-muted mt-0.5">
                  {plan === 'free' ? '5 background removals per day' : 'Unlimited background removals'}
                </p>
              </div>
              {plan === 'free' && (
                <a href="/pricing" className="bg-purple text-white px-4 py-2 rounded-lg text-[13px] font-semibold no-underline hover:bg-purple-hover transition-colors">
                  Upgrade
                </a>
              )}
              {plan !== 'free' && (
                <span className="bg-green-100 text-green-700 text-[11px] font-bold px-3 py-1 rounded-full">Active</span>
              )}
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <div className="flex flex-wrap gap-4 text-[12.5px] text-muted">
                <div>
                  <span className="font-semibold text-text2">Storage:</span> Supabase Cloud
                </div>
                <div>
                  <span className="font-semibold text-text2">Max file size:</span> 25 MB
                </div>
                <div>
                  <span className="font-semibold text-text2">Max resolution:</span> 2048px
                </div>
              </div>
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferences" desc="Default settings for background removal.">
            <Field label="Default model">
              <select className="w-full bg-bg border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] text-text outline-none focus:border-purple transition-all">
                <option value="auto">Auto-detect (recommended)</option>
                <option value="u2net">General Purpose</option>
                <option value="u2net_human_seg">Portrait & People</option>
                <option value="isnet-general-use">ISNet (sharp edges)</option>
              </select>
            </Field>
            <Field label="Enhance edges">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-purple w-4 h-4" />
                <span className="text-[13.5px] text-text2">Enable edge refinement by default</span>
              </label>
            </Field>
            <Field label="Auto-save results">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-purple w-4 h-4" />
                <span className="text-[13.5px] text-text2">Save results to Supabase Storage</span>
              </label>
            </Field>
          </Section>

          {/* Danger zone */}
          <Section title="Danger Zone" desc="Irreversible actions. Proceed with caution.">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <p className="text-[13.5px] font-bold text-red-700 mb-1">Delete account</p>
              <p className="text-[12.5px] text-red-600 mb-4">
                This will permanently delete your account and all associated data. Type your email to confirm.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={user?.email}
                  className="flex-1"
                />
                <Btn
                  variant="danger"
                  loading={deleting}
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== user?.email}
                >
                  Delete account
                </Btn>
              </div>
            </div>
          </Section>

          {/* Sign out */}
          <div className="flex justify-end pt-2">
            <Btn variant="secondary" onClick={signOut}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-4 h-4">
                <path d="M13 7l3 3m0 0l-3 3m3-3H7m6-6H5a2 2 0 00-2 2v8a2 2 0 002 2h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </Btn>
          </div>

        </div>
      </div>
    </div>
  )
}
