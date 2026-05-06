import { useCallback, useEffect, useRef, useState } from 'react'
import { HiPhoto, HiShieldCheck } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import settingsService from '../../../services/settingsService.js'

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico'

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-24 w-full animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

export default function LogoSettings() {
  const [logos, setLogos] = useState({ largeLogo: '', smallLogo: '', favicon: '' })
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await settingsService.getLogo()
      setLogos({
        largeLogo: res?.data?.largeLogo || '',
        smallLogo: res?.data?.smallLogo || '',
        favicon:   res?.data?.favicon   || '',
      })
    } catch (err) {
      toast.error(err?.message || 'Failed to load logos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Platform Branding</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Customize the visual identity of the Control Center.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiPhoto className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <GridSkeleton />
      ) : (
        <div className="space-y-6 pb-24">
          {/* Main Logos Section */}
          <section className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Navigation Logos</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sidebar Branding</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <LogoSlot
                title="Full Identity"
                caption="Main sidebar logo"
                hint="Best: 185x45px (PNG/SVG)"
                type="large"
                currentUrl={logos.largeLogo}
                onUploaded={(url) => setLogos((l) => ({ ...l, largeLogo: url }))}
              />
              <LogoSlot
                title="Compact Identity"
                caption="Collapsed menu icon"
                hint="Best: 45x45px (PNG/SVG)"
                type="small"
                currentUrl={logos.smallLogo}
                onUploaded={(url) => setLogos((l) => ({ ...l, smallLogo: url }))}
              />
            </div>
          </section>

          {/* Browser Presence */}
          <section className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Browser Experience</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tab Assets</p>
              </div>
            </div>

            <div className="max-w-sm">
              <LogoSlot
                title="Tab Favicon"
                caption="Browser bookmark icon"
                hint="Best: 32x32px (.ico / .png)"
                type="favicon"
                currentUrl={logos.favicon}
                onUploaded={(url) => setLogos((l) => ({ ...l, favicon: url }))}
              />
            </div>
          </section>

          {/* Note */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-[11px] font-medium text-blue-700 border-dashed">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                <HiShieldCheck className="h-4 w-4" />
              </div>
              <p className="leading-relaxed">
                <strong>Administrative Isolation:</strong> These assets apply to the <span className="font-bold underline">SuperAdmin Control Center</span>. 
                Organization branding is managed by tenants independently.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LogoSlot({ title, caption, hint, type, currentUrl, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const onPick = () => inputRef.current?.click()

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large (Max 2MB)')
      return
    }

    const fd = new FormData()
    fd.append('logo', file)

    setUploading(true)
    try {
      const res = await settingsService.uploadLogo(type, fd)
      const url = res?.data?.url
      toast.success(`${title} Updated`)
      onUploaded?.(url)
      window.dispatchEvent(
        new CustomEvent('platform-logo-updated', { detail: { type, url } })
      )
    } catch (err) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-[13px] font-black text-slate-800">{title}</h4>
        <p className="text-[10px] font-medium text-slate-400">{caption}</p>
      </div>

      <div className="relative group/logo h-28 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 transition-all hover:border-blue-500 hover:bg-white overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-3">
          {currentUrl ? (
            <img src={currentUrl} alt={title} className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform group-hover/logo:scale-105" />
          ) : (
            <HiPhoto className="h-8 w-8 text-slate-200" />
          )}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
           <button
             type="button"
             onClick={onPick}
             disabled={uploading}
             className="rounded-lg bg-white px-4 py-2 text-[10px] font-black text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
           >
             {uploading ? 'Uploading...' : 'Change Logo'}
           </button>
        </div>
      </div>

      <p className="text-[9px] font-bold text-slate-400 tracking-tight italic">{hint}</p>
      
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  )
}
