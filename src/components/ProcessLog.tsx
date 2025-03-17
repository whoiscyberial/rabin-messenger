import Logs from '@/components/Logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      <CardContent className='h-[700px]'>
        <Logs logs={logs} className={'h-full'} />
      </CardContent>
    </Card>
  )
}
