import { ErrorMessage } from "./ErrorMessage"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  isError?: boolean
  errorMessage?: string
}

export function Input({ label, isError, errorMessage, id, ...rest }: Props) {
  return (
    <div>
      <label htmlFor={id} className="text-lg">
        {label}
      </label>
      <input
        id={id}
        className="bg-section text-lg text-white px-3 py-2 mt-1 rounded-md w-full"
        {...rest}
      />
      {isError && errorMessage && (
        <ErrorMessage className="mt-2">{errorMessage}</ErrorMessage>
      )}
    </div>
  )
}
