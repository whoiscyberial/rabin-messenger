import { AutoExample } from '@/components/AutoExample'
import { ChatInput } from '@/components/ChatInput'
import { KeySetup } from '@/components/KeySetup'
import { MessageList } from '@/components/MessageList'
import { ProcessLog } from '@/components/ProcessLog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { bigIntToString, decrypt, encrypt, stringToBigInt } from '@/lib/rabin'
import type { Message } from '@/lib/types'
import { Code, KeyRound, MessageSquare } from 'lucide-react'
import { useState } from 'react'

function App() {
  const [publicKey, setPublicKey] = useState<bigint | null>(null)
  const [privateKey, setPrivateKey] = useState<{ p: bigint; q: bigint } | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [processLog, setProcessLog] = useState<string[]>([])

  const addToLog = (log: string) => {
    setProcessLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`])
  }

  const handleKeysGenerated = (publicKey: bigint, privateKey: { p: bigint; q: bigint }) => {
    setPublicKey(publicKey)
    setPrivateKey(privateKey)
    addToLog(`Ключи сгенерированы. Открытый ключ (n): ${publicKey}. Закрытый ключ (p, q): ${privateKey.p}, ${privateKey.q}`)
  }

  const handleSendMessage = (content: string) => {
    try {
      if (!publicKey || !privateKey) {
        console.error('Ключи не сгенерированы')
        return
      }

      if (!content.trim()) {
        console.error('Сообщение не может быть пустым')
        return
      }

      addToLog(`Отправлено сообщение: "${content}"`)

      // Конвертируем строку в BigInt
      const messageBigInt = stringToBigInt(content)
      addToLog(`Сообщение преобразовано в BigInt: ${messageBigInt}`)

      // Шифруем сообщение
      const encrypted = encrypt(messageBigInt, publicKey)
      addToLog(`Сообщение зашифровано: ${encrypted}`)

      // Расшифровываем сообщение
      const decryptedValues = decrypt(encrypted, privateKey)
      addToLog(`Сообщение расшифровано, возможные значения: ${decryptedValues.map((val) => val.toString()).join(', ')}`)

      // Находим правильное расшифрованное значение
      let originalFound = false
      let decryptedMessage = ''

      for (const value of decryptedValues) {
        try {
          const str = bigIntToString(value)
          addToLog(`Проверка расшифрованного значения ${value} -> "${str}"`)

          if (str === content) {
            decryptedMessage = str
            originalFound = true
            addToLog(`✓ Найдено исходное сообщение: "${str}"`)
            break
          }
        } catch {
          addToLog(`× Значение ${value} не является допустимой строкой UTF-8`)
        }
      }

      if (!originalFound) {
        addToLog('❌ Исходное сообщение не найдено среди вариантов расшифровки')
      }

      const newMessage: Message = {
        original: content,
        encrypted,
        decrypted: decryptedValues,
        decryptedMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newMessage])
      setMessage('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className='min-h-screen bg-background text-foreground p-8'>
      <div className='max-w-6xl mx-auto'>
        <header className='text-start flex flex-col items-start gap-1 w-full mb-12'>
          <h1 className='text-xl font-bold'>Мессенджер на основе криптосистемы Рабина</h1>
          <h2 className='text-sm text-muted-foreground'>Шабалин Сергей, ИСиТ, гр. 607-11</h2>
          {publicKey ? (
            <>
              <Separator className='my-2' />
              <p className='text-muted-foreground break-all text-sm'>Открытый ключ (n): {publicKey.toString()}</p>
            </>
          ) : null}
        </header>

        <Tabs defaultValue='playground' className='space-y-6'>
          <TabsList className='flex w-full h-auto md:flex-row flex-col'>
            <TabsTrigger value='playground' className='py-2 w-full md:w-auto flex items-center gap-2'>
              <KeyRound className='h-4 w-4' />
              Настройка ключей
            </TabsTrigger>
            <TabsTrigger value='messenger' className='py-2 w-full md:w-auto flex items-center gap-2'>
              <MessageSquare className='h-4 w-4' />
              Мессенджер
            </TabsTrigger>
            <TabsTrigger value='example' className='py-2 w-full md:w-auto flex items-center gap-2'>
              <Code className='h-4 w-4' />
              Автоматический пример
            </TabsTrigger>
          </TabsList>

          <TabsContent value='playground'>
            <KeySetup onKeysGenerated={handleKeysGenerated} />
          </TabsContent>

          <TabsContent value='messenger'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-6'>
                <div>
                  <ChatInput name='Отправить сообщение' value={message} onChange={setMessage} onSend={() => handleSendMessage(message)} disabled={!publicKey} />
                </div>
                <MessageList messages={messages} />
              </div>
              <ProcessLog logs={processLog} />
            </div>
          </TabsContent>

          <TabsContent value='example'>
            <AutoExample />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
