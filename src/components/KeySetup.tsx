import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateKeyPair, generateKeys } from '@/lib/rabin'
import { KeyRound, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface KeySetupProps {
  onKeysGenerated: (publicKey: bigint, privateKey: { p: bigint; q: bigint }) => void
}

export function KeySetup({ onKeysGenerated }: KeySetupProps) {
  const [p, setP] = useState('')
  const [q, setQ] = useState('')
  const [bitLength, setBitLength] = useState('512')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerateKeys = () => {
    try {
      const pBig = BigInt(p)
      const qBig = BigInt(q)
      const keys = generateKeys(pBig, qBig)
      onKeysGenerated(keys.publicKey, keys.privateKey)
      setError('')
    } catch {
      setError('Неверные простые числа. Оба числа p и q должны быть простыми и сравнимыми с 3 по модулю 4.')
    }
  }

  const handleGenerateRandomKeys = () => {
    try {
      setLoading(true)
      setError('')

      // Используем setTimeout, чтобы UI обновился перед CPU-интенсивной операцией
      setTimeout(() => {
        try {
          const bits = parseInt(bitLength)
          if (isNaN(bits) || bits < 32 || bits > 1024) {
            setError('Длина бита должна быть между 32 и 1024')
            setLoading(false)
            return
          }

          const keys = generateKeyPair(bits)
          onKeysGenerated(keys.publicKey, keys.privateKey)

          // Обновляем поля p и q сгенерированными значениями
          setP(keys.privateKey.p.toString())
          setQ(keys.privateKey.q.toString())
          setLoading(false)
        } catch {
          setError('Не удалось сгенерировать ключи. Пожалуйста, попробуйте снова.')
          setLoading(false)
        }
      }, 100)
    } catch {
      setError('Не удалось сгенерировать ключи. Пожалуйста, попробуйте снова.')
      setLoading(false)
    }
  }

  return (
    <div className='grid gap-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Генерация ключей</CardTitle>
          <CardDescription>Генерация p и q ключей для шифрования и дешифрования.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Tabs defaultValue='random'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='random'>Сгенерировать</TabsTrigger>
              <TabsTrigger value='manual'>Ввести вручную</TabsTrigger>
            </TabsList>

            <TabsContent value='random' className='space-y-4 pt-4'>
              <div className='space-y-2'>
                <label>Длина бита</label>
                <div className='flex gap-2'>
                  <Input value={bitLength} onChange={(e) => setBitLength(e.target.value)} placeholder='напр., 512' type='number' min='32' max='1024' />
                  <Button onClick={handleGenerateRandomKeys} disabled={loading} className='whitespace-nowrap'>
                    {loading ? (
                      <>
                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                        Генерация...
                      </>
                    ) : (
                      <>
                        <KeyRound className='mr-2 h-4 w-4' />
                        Сгенерировать
                      </>
                    )}
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>Генерирует случайные простые числа Блюма (p ≡ 3 mod 4 и q ≡ 3 mod 4)</p>
              </div>
            </TabsContent>

            <TabsContent value='manual' className='space-y-4 pt-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label>Простое число p</label>
                  <Input value={p} onChange={(e) => setP(e.target.value)} placeholder='напр., 7' />
                </div>
                <div className='space-y-2'>
                  <label>Простое число q</label>
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder='напр., 11' />
                </div>
              </div>
              <Button onClick={handleGenerateKeys} className='w-full'>
                <KeyRound className='mr-2 h-4 w-4' />
                Сгенерировать ключи
              </Button>
              <p className='text-xs text-muted-foreground'>Оба числа p и q должны быть простыми и сравнимыми с 3 по модулю 4</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
