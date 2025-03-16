import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Message } from '@/lib/types'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История сообщений</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[400px]'>
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-4 p-3 rounded-lg ${msg.sender === 'Алиса' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
              <div className='flex items-center justify-between mb-1'>
                <span className='font-bold'>{msg.sender}</span>
                <span className='text-xs opacity-70'>{msg.timestamp.toLocaleTimeString()}</span>
              </div>

              <div className='mb-2 text-base'>{msg.original}</div>
              <Separator className='my-2 bg-muted-foreground/20' />
              <div className='text-xs space-y-1 text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-xs bg-neutral-100 text-neutral-800'>
                    Зашифровано
                  </Badge>
                  <span className='font-mono truncate'>{msg.encrypted.toString()}</span>
                </div>

                {msg.decryptedMessage && (
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs bg-green-100 text-green-800'>
                      Расшифровано
                    </Badge>
                    <span className='font-mono'>{msg.decryptedMessage}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
