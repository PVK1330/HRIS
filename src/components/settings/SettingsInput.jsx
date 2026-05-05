import { Input } from '../ui/Input.jsx'

/**
 * Wrapper around the shared <Input /> primitive that pins styling to the
 * Settings spec (`focus:ring-red-500 focus:border-red-500`, `rounded-md`).
 *
 * Forwards every prop to <Input /> via `...rest`. Use `inputClassName` to
 * append additional input-element classes (e.g. for the password show/hide
 * trailing button slot).
 */
export default function SettingsInput({
  label,
  required,
  helpText,
  inputClassName = '',
  className = '',
  ...rest
}) {
  return (
    <Input
      label={label}
      required={required}
      helpText={helpText}
      className={className}
      inputClassName={`!rounded-md focus:!border-red-500 focus:!ring-red-200 ${inputClassName}`}
      {...rest}
    />
  )
}
