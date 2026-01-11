import clsx from "clsx"

type ErrorMessageProps = React.HTMLAttributes<HTMLParagraphElement>

export function ErrorMessage({ className, ...rest }: ErrorMessageProps) {
  return <p className={clsx("text-red-400 text-lg", className)} {...rest} />
}
