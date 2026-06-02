import { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import settingsService from '../../../services/settingsService.js'

export default function LogoSettings() {
  const [data, setData] = useState({ largeLogo: null, smallLogo: null, favicon: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [filesToUpload, setFilesToUpload] = useState({ large: null, small: null, favicon: null })
  const [previews, setPreviews] = useState({ large: null, small: null, favicon: null })

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getLogo()
      const apiData = res?.data || {}
      setData({
        largeLogo: apiData.largeLogo || null,
        smallLogo: apiData.smallLogo || null,
        favicon: apiData.favicon || null,
      })
    } catch (err) {
      toast.error(err?.message || 'Failed to load brand assets')
      setData({ largeLogo: null, smallLogo: null, favicon: null })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previews.large) URL.revokeObjectURL(previews.large)
      if (previews.small) URL.revokeObjectURL(previews.small)
      if (previews.favicon) URL.revokeObjectURL(previews.favicon)
    }
  }, [previews])

  const handleFileChange = (type, file) => {
    if (!file) return
    
    // Revoke old preview
    if (previews[type]) URL.revokeObjectURL(previews[type])
    
    setFilesToUpload(prev => ({ ...prev, [type]: file }))
    setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }))
  }

  const handleDiscard = () => {
    if (previews.large) URL.revokeObjectURL(previews.large)
    if (previews.small) URL.revokeObjectURL(previews.small)
    if (previews.favicon) URL.revokeObjectURL(previews.favicon)
    
    setFilesToUpload({ large: null, small: null, favicon: null })
    setPreviews({ large: null, small: null, favicon: null })
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    
    let successCount = 0
    let failCount = 0
    
    try {
      const uploads = []
      
      for (const type of ['large', 'small', 'favicon']) {
        const file = filesToUpload[type]
        if (file) {
          const formData = new FormData()
          formData.append('logo', file)
          uploads.push(settingsService.uploadLogo(type, formData).then(() => { successCount++ }).catch(e => { failCount++; console.error(e) }))
        }
      }
      
      if (uploads.length === 0) {
        toast('No changes to save', { icon: 'ℹ️' })
        return
      }

      await Promise.all(uploads)
      
      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} asset(s)`)
      }
      
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} asset(s)`)
        handleDiscard() // clear previews and pending files
        await load() // refresh current images
      }
    } catch (err) {
      toast.error('An error occurred during upload')
    } finally {
      setSaving(false)
    }
  }

  const isDirty = Object.values(filesToUpload).some(f => f !== null)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-48 rounded-xl bg-gray-100"></div>
          <div className="h-48 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  const ImageUploader = ({ label, description, currentUrl, previewUrl, onFileChange }) => (
    <div className="sm:col-span-3">
      <label className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      <div className="mt-4 flex items-center gap-x-5">
        {(previewUrl || currentUrl) ? (
          <div className={`overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-2 relative ${previewUrl ? 'ring-2 ring-indigo-500' : ''}`} style={{ width: 120, height: 120 }}>
            {previewUrl && <div className="absolute top-1 right-1 bg-indigo-500 text-white text-[9px] px-1.5 rounded uppercase font-bold tracking-wider">New</div>}
            <img src={previewUrl || currentUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400" style={{ width: 120, height: 120 }}>
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        )}
        
        <div>
          <label className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <span>Change</span>
            <input type="file" className="sr-only" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0])} />
          </label>
          <p className="mt-2 text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 2MB</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Brand Assets</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Customize the platform's visual identity with custom logos and favicons.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-10">
              <ImageUploader 
                label="Primary Logo (Large)"
                description="Used in the main sidebar and top navigation. Transparent PNG recommended."
                currentUrl={data.largeLogo}
                previewUrl={previews.large}
                onFileChange={(f) => handleFileChange('large', f)}
              />

              <div className="border-t border-gray-900/5"></div>

              <ImageUploader 
                label="Alternative Logo (Small)"
                description="Used in collapsed sidebars or mobile headers. Usually a square symbol."
                currentUrl={data.smallLogo}
                previewUrl={previews.small}
                onFileChange={(f) => handleFileChange('small', f)}
              />

              <div className="border-t border-gray-900/5"></div>

              <ImageUploader 
                label="Favicon"
                description="Shown in browser tabs. Must be a square image (32x32)."
                currentUrl={data.favicon}
                previewUrl={previews.favicon}
                onFileChange={(f) => handleFileChange('favicon', f)}
              />
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!isDirty || saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Uploading...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
