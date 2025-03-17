import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Root as ScrollAreaRoot } from '@radix-ui/react-scroll-area'

type LogsProps = React.ComponentPropsWithoutRef<typeof ScrollAreaRoot> & {
  logs: string[]
}
export default function Logs({ logs, className, ...props }: LogsProps) {
  return (
    <ScrollArea className={cn('h-[400px] w-full rounded-md border p-2 md:p-4 font-mono text-sm bg-muted/40', className)} {...props}>
      {logs.map((log, index) => (
        <div key={index} className='mb-3 break-words hyphens-auto'>
          {log}
        </div>
      ))}
    </ScrollArea>
  )
}
