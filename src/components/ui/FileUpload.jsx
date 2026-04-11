import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { HiDocument, HiXMark } from 'react-icons/hi2'

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageFile(file) {
  const t = file.type
  return t === 'image/jpeg' || t === 'image/png' || t === 'image/webp'
}

function ImageThumb({ file }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      className="h-20 w-20 rounded-lg object-cover"
    />
  )
}

export default function FileUpload({
  label,
  name,
  accept,
  multiple = false,
  onChange,
  helpText,
  required,
}) {
  const inputRef = useRef(null)
  const reactId = useId()
  const inputId = name ? `${name}-${reactId}` : `file-upload-${reactId}`
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const emitChange = useCallback(
    (next) => {
      setFiles(next)
      if (typeof onChange === 'function') {
        onChange(next)
      }
    },
    [onChange]
  )

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || [])
      if (incoming.length === 0) return
      const next = multiple ? [...files, ...incoming] : incoming
      emitChange(next)
    },
    [emitChange, files, multiple]
  )

  const handleInputChange = (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeAt = (index) => {
    const next = files.filter((_, i) => i !== index)
    emitChange(next)
  }

  const openPicker = () => {
    inputRef.current?.click()
  }

  const zoneClasses = [
    'cursor-pointer rounded-xl border-2 border-dashed p-4 transition-colors',
    'border-gray-300',
    isDragging ? 'border-[#004CA5] bg-blue-50' : 'hover:border-gray-400 hover:bg-gray-50',
  ].join(' ')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={zoneClasses}
      >
        <p className="text-center text-sm text-gray-600">
          <span className="font-medium text-[#004CA5]">Click to browse</span>
          <span className="text-gray-500"> or drag and drop files here</span>
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`} className="relative">
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-white shadow hover:bg-gray-700"
                aria-label={`Remove ${file.name}`}
              >
                <HiXMark className="h-4 w-4" aria-hidden />
              </button>

              {isImageFile(file) ? (
                <div className="flex justify-center">
                  <ImageThumb file={file} />
                </div>
              ) : (
                <div className="flex min-h-[5rem] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-2 text-center">
                  <HiDocument className="mb-1 h-8 w-8 text-gray-500" aria-hidden />
                  <p className="line-clamp-2 w-full break-all text-xs font-medium text-gray-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {helpText && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
    </div>
  )
}
