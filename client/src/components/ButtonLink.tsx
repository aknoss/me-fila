import clsx from "clsx"
import Spinner from "../assets/spinner.svg"
import { Link } from "react-router"
import type { LinkProps } from "react-router"

type ButtonLinkProps = LinkProps & {
  isLoading?: boolean
  variant?: "primary" | "secondary"
}

export function ButtonLink({
  isLoading,
  variant = "primary",
  ...rest
}: ButtonLinkProps) {
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary/90 active:bg-primary/80"
      : "bg-secondary text-black hover:bg-secondary/80 active:bg-secondary/70"

  if (isLoading) {
    return (
      <div
        className={clsx(
          "rounded-md h-16 flex items-center justify-center",
          styles
        )}
      >
        <img src={Spinner} width={36} />
      </div>
    )
  }

  return (
    <Link
      className={clsx(
        "text-center text-3xl cursor-pointer w-full",
        "rounded-md h-16 flex items-center justify-center",
        styles
      )}
      {...rest}
    />
  )
}
