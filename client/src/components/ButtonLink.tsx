import clsx from "clsx";
import { Link, LinkProps } from "react-router";
import Spinner from "../assets/spinner.svg";

type ButtonLinkProps = LinkProps & { isLoading?: boolean };

export function ButtonLink({ isLoading, ...rest }: ButtonLinkProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md h-16 flex items-center justify-center">
        <img src={Spinner} width={36} />
      </div>
    );
  }

  return (
    <Link
      className={clsx(
        "text-black text-center text-3xl cursor-pointer w-full",
        "bg-white rounded-md hover:bg-gray-200 active:bg-gray-300 h-16 flex items-center justify-center"
      )}
      {...rest}
    />
  );
}
