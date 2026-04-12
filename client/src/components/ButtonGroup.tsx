type Props = {
  children: React.ReactNode
}

export function ButtonGroup({ children }: Props) {
  return (
    <div className="flex flex-col sm:flex-row-reverse gap-5 w-full">
      {children}
    </div>
  )
}
