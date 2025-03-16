import Logs from '@/components/Logs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { bigIntToString, decryptWithPQ, encrypt, generateKey, stringToBigInt } from '@/lib/rabin'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export function AutoExample() {
  const [logs, setLogs] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message])
  }

  const runExample = async () => {
    setRunning(true)
    setLogs([])

    try {
      // Генерация пары ключей
      addLog('Генерация пары ключей...')
      const [n, p, q] = generateKey(512)
      addLog(`Открытый ключ (n): ${n}`)
      addLog(`Закрытый ключ (p): ${p}`)
      addLog(`Закрытый ключ (q): ${q}`)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Исходное сообщение
      const originalMessage = 'Привет'
      addLog(`\nСообщение отправителя: "${originalMessage}"`)

      // Конвертируем сообщение в BigInt
      const messageBigInt = stringToBigInt(originalMessage)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Шифруем сообщение
      const encryptedMessage = encrypt(messageBigInt, n)
      addLog(`Зашифрованное сообщение: ${encryptedMessage}`)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Расшифровываем сообщение
      addLog('\nРасшифровка...')
      const possibleMessages = decryptWithPQ(encryptedMessage, p, q)

      let finalMessage = null

      for (let i = 0; i < possibleMessages.length; i++) {
        const value = possibleMessages[i]
        try {
          const decryptedString = bigIntToString(value)
          addLog(`Вариант ${i + 1}: ${value} -> "${decryptedString}"`)

          if (decryptedString === originalMessage) {
            finalMessage = decryptedString
            addLog(`✓ Вариант ${i + 1} соответствует исходному сообщению!`)
          }
        } catch {
          addLog(`Вариант ${i + 1}: ${value} -> [Недопустимая строка UTF-8]`)
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      addLog(`\nСообщение получено получателем: "${finalMessage}"`)
    } catch (error) {
      addLog(`Ошибка: ${error}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Автоматический пример</CardTitle>
        <CardDescription>Этот пример автоматически создает ключи и отправляет 2 сообщения</CardDescription>
      </CardHeader>
      <CardContent>
        <Logs logs={logs} />
      </CardContent>
      <CardFooter>
        <Button onClick={runExample} disabled={running} className='w-full'>
          {running ? (
            <>
              <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              Выполнение...
            </>
          ) : (
            'Запустить пример'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
