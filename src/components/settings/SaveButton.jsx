import { Button } from '../ui/Button.jsx'

/**
 * Settings-specific Save button.
 *
 * Wraps the shared <Button /> primitive but pins the visual to the spec's
 * color tokens (`bg-red-600`, `hover:bg-red-700`, `rounded-md`, `px-6`)
 * using `!` Tailwind important utilities so the underlying Button's
 * `#C8102E` brand class can't override them.
 */
export default function SaveButton({
  loading = false,
  onClick,
  disabled = false,
  children = 'Save Changes',
  className = '',
  type = 'button',
}) {
  return (
    <Button
      label={children}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      type={type}
      variant="primary"
      className={`!rounded-md !bg-red-600 !px-6 !py-2 hover:!bg-red-700 ${className}`}
    />
  )
}
