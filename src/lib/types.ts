export type Message = {
  original: string
  encrypted: bigint
  decrypted?: bigint[]
  decryptedMessage?: string
  timestamp: Date
}
