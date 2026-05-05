import { useCallback, useEffect, useRef, useState } from 'react'
import { HiPhoto } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import SettingsCard from '../../../components/settings/SettingsCard.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import settingsService from '../../../services/settingsService.js'

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico'

function LogoSlot({ title, caption, hint, type, currentUrl, onUploaded, alignCenter }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const onPick = () => inputRef.current?.click()

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large. Max size is 2 MB')
      return
    }

    const fd = new FormData()
    fd.append('logo', file)

    setUploading(true)
    try {
      const res = await settingsService.uploadLogo(type, fd)
      const url = res?.data?.url
      toast.success(`${title} uploaded`)
      onUploaded?.(url)
    } catch (err) {
      toast.error(err?.message || 'Logo upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {caption && <p className="mt-1 text-sm text-gray-500">{caption}</p>}

      <div className={`mt-4 flex ${alignCenter ? 'flex-col items-center text-center' : 'flex-col items-start'} gap-4`}>
        <div className="flex h-24 w-full max-w-xs items-center justify-center rounded-md border border-gray-200 bg-gray-50">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt={title}
              className="max-h-20 max-w-full object-contain"
            />
          ) : (
            <HiPhoto className="h-10 w-10 text-gray-300" aria-hidden />
          )}
        </div>

        {hint && <p className="text-xs text-gray-500">{hint}</p>}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onFileChange}
          className="hidden"
        />
        <Button
          label={uploading ? 'Uploading…' : 'Change Logo'}
          variant="outline"
          loading={uploading}
          onClick={onPick}
          className="!rounded-md !border-red-300 !text-red-600 hover:!bg-red-50"
        />
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-3 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-24 w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-9 w-32 animate-pulse rounded bg-gray-200" />
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
    <div className="space-y-6">
      {loading ? (
        <>
          <GridSkeleton />
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <LogoSlot
              title="Large Logo"
              caption="Used when the main menu is expanded"
              hint="Best image dimensions: (185px × 45px)"
              type="large"
              currentUrl={logos.largeLogo}
              onUploaded={(url) => setLogos((l) => ({ ...l, largeLogo: url }))}
            />
            <LogoSlot
              title="Small Logo"
              caption="Used when the main menu is collapsed"
              hint="Best image dimensions: (45px × 45px)"
              type="small"
              currentUrl={logos.smallLogo}
              onUploaded={(url) => setLogos((l) => ({ ...l, smallLogo: url }))}
            />
          </div>

          <SettingsCard title="Favicon">
            <LogoSlot
              title="Favicon"
              caption="Displayed on the web browser tab"
              hint="Best image dimensions: (16px × 16px)"
              type="favicon"
              currentUrl={logos.favicon}
              alignCenter
              onUploaded={(url) => setLogos((l) => ({ ...l, favicon: url }))}
            />
          </SettingsCard>
        </>
      )}

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        These logos are only for use inside this dashboard. Your customers will be
        able to upload their own logos for their dashboards.
      </div>
    </div>
  )
}
