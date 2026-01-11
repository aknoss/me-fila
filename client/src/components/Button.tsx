import clsx from "clsx"
import Spinner from "../assets/spinner.svg"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean
}

export function Button({ isLoading, ...rest }: ButtonProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md h-16 flex items-center justify-center">
        <img src={Spinner} width={36} />
      </div>
    )
  }

  return (
    <button
      className={clsx(
        "text-black text-center text-3xl cursor-pointer w-full",
        "bg-white rounded-md hover:bg-gray-200 active:bg-gray-300 h-16 flex items-center justify-center"
      )}
      {...rest}
    />
  )
}
