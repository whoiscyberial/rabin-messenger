import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

interface ChatInputProps {
  name: string
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export function ChatInput({ name, value, onChange, onSend, disabled }: ChatInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex space-x-2'>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Введите сообщение...'
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !disabled && value.trim()) {
                onSend()
              }
            }}
          />
          <Button onClick={onSend} disabled={disabled || !value.trim()}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
        {disabled && <span className='text-xs text-destructive'>Для начала сгенерируйте ключи</span>}
      </CardContent>
    </Card>
  )
}
