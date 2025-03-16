import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ProcessLogProps {
  logs: string[]
}

export function ProcessLog({ logs }: ProcessLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Логи</CardTitle>
        <CardDescription>Процесс шифрования и дешифрования</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[600px] w-full rounded-md border p-4'>
          {logs.map((log, idx) => (
            <div key={idx} className='text-sm mb-1 font-mono'>
              {log}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
