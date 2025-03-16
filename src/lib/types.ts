export type Message = {
  sender: 'Алиса' | 'Боб'
  original: string
  encrypted: bigint
  decrypted?: bigint[]
  decryptedMessage?: string
  timestamp: Date
}
