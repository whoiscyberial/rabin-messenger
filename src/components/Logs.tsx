import { ScrollArea } from '@/components/ui/scroll-area'

export default function Logs({ logs }: { logs: string[] }) {
  return (
    <ScrollArea className='h-[400px] w-full rounded-md border p-2 md:p-4 font-mono text-sm'>
      {logs.map((log, index) => (
        <div key={index} className='mb-1 break-words hyphens-auto'>
          {log}
        </div>
      ))}
    </ScrollArea>
  )
}
