type Props = {
  children: React.ReactNode
}

export function Wrapper({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col max-w-[640px] px-4 py-16 items-center gap-32 sm:mx-auto w-full">
        {children}
      </div>
    </div>
  )
}
