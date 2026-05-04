import { Toggle } from '../ui/Toggle.jsx'

/**
 * Settings-specific wrapper around the shared <Toggle /> primitive.
 * Existing component already accepts { checked, onChange, label, disabled };
 * this wrapper just forwards them so call-sites use a consistent name.
 */
export default function SettingsToggle({ checked, onChange, label, disabled }) {
  return <Toggle checked={!!checked} onChange={onChange} label={label} disabled={disabled} />
}
