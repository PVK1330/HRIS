import React from 'react'
import { Button } from './Button.jsx'

/**
 * Global EmptyState Component
 * @param {string} title - Main heading
 * @param {string} description - Subtext describing the empty state
 * @param {string} image - Path to the image (defaults to global_no_data.png)
 * @param {string} actionLabel - Text for the CTA button
 * @param {function} onAction - Callback for the CTA button
 * @param {React.ReactNode} icon - Icon for the CTA button
 */
export const EmptyState = ({ 
  title = "No Data Found", 
  description = "It looks like there's nothing here yet.", 
  image = "/global_no_data.png", 
  actionLabel, 
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-6 h-48 w-48 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200/50">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <Button 
          label={actionLabel} 
          variant="primary" 
          icon={icon} 
          className="mt-8 shadow-xl shadow-emerald-900/10 px-8"
          onClick={onAction}
        />
      )}
    </div>
  )
}
