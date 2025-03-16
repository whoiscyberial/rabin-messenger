// Реализация криптосистемы Рабина

// Константы
const TWO = 2n
const THREE = 3n
const FOUR = 4n

/**
 * Вычисляет (base^exponent) % modulus эффективно
 */
export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n
  let result = 1n
  base = base % modulus
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus
    }
    base = (base * base) % modulus
    exponent = exponent >> 1n
  }
  return result
}

/**
 * Проверяет, является ли число квадратичным вычетом по модулю p
 */
export function isQuadraticResidue(a: bigint, p: bigint): boolean {
  return modPow(a, (p - 1n) / 2n, p) === 1n
}

/**
 * Генерирует простое число Блюма (простое число p, где p ≡ 3 (mod 4))
 * @param bitLength Битовая длина генерируемого простого числа
 * @returns Простое число Блюма
 */
export function generateBlumPrime(bitLength: number): bigint {
  const generateRandomPrime = (bits: number): bigint => {
    // Простой тест на простоту
    const isProbablePrime = (n: bigint): boolean => {
      if (n <= 1n) return false
      if (n <= 3n) return true
      if (n % 2n === 0n) return false

      const a = 2n
      return modPow(a, n - 1n, n) === 1n
    }

    let candidate: bigint
    do {
      // Генерируем случайное число указанной битовой длины
      let hex = ''
      for (let i = 0; i < Math.ceil(bits / 4); i++) {
        hex += Math.floor(Math.random() * 16).toString(16)
      }
      candidate = BigInt('0x' + hex)
      // Убеждаемся, что число нечетное
      if (candidate % 2n === 0n) candidate += 1n
    } while (!isProbablePrime(candidate))

    return candidate
  }

  let p: bigint
  do {
    p = generateRandomPrime(bitLength)
  } while (p % FOUR !== THREE)

  return p
}

/**
 * Генерирует пару ключей для криптосистемы Рабина
 * @param bitLength Битовая длина ключа (будет разделена между p и q)
 * @returns Массив с [n, p, q]
 */
export function generateKey(bitLength: number = 512): [bigint, bigint, bigint] {
  const p = generateBlumPrime(bitLength / 2)
  const q = generateBlumPrime(bitLength / 2)
  const n = p * q
  return [n, p, q]
}

/**
 * Генерирует пару ключей для криптосистемы Рабина (формат объекта)
 * @param bitLength Битовая длина ключа (будет разделена между p и q)
 * @returns Открытый и закрытый ключи в виде объекта
 */
export function generateKeyPair(bitLength: number = 512): {
  publicKey: bigint
  privateKey: { p: bigint; q: bigint }
} {
  const [n, p, q] = generateKey(bitLength)
  return { publicKey: n, privateKey: { p, q } }
}

/**
 * Создает пару ключей из существующих значений p и q
 */
export function generateKeys(p: bigint, q: bigint) {
  if (p % FOUR !== THREE || q % FOUR !== THREE) {
    throw new Error('Оба числа p и q должны быть сравнимы с 3 по модулю 4')
  }
  const n = p * q
  return { publicKey: n, privateKey: { p, q } }
}

/**
 * Шифрует сообщение с использованием криптосистемы Рабина
 * @param message Сообщение для шифрования
 * @param publicKey Открытый ключ (n)
 * @returns Зашифрованное сообщение
 */
export function encrypt(message: bigint, publicKey: bigint): bigint {
  return modPow(message, TWO, publicKey)
}

/**
 * Расширенный алгоритм Евклида для нахождения НОД и коэффициентов Безу
 * @returns [gcd, x, y], где gcd - наибольший общий делитель, а x, y - коэффициенты Безу
 */
export function extendedGCD(a: bigint, b: bigint): [bigint, bigint, bigint] {
  let old_r = a
  let r = b
  let old_s = 1n
  let s = 0n
  let old_t = 0n
  let t = 1n

  while (r !== 0n) {
    const quotient = old_r / r
    ;[old_r, r] = [r, old_r - quotient * r]
    ;[old_s, s] = [s, old_s - quotient * s]
    ;[old_t, t] = [t, old_t - quotient * t]
  }

  return [old_r, old_s, old_t] // [gcd, x, y]
}

/**
 * Расшифровывает шифротекст с использованием криптосистемы Рабина
 * @param ciphertext Зашифрованное сообщение
 * @param p Первый простой множитель
 * @param q Второй простой множитель
 * @returns Массив из четырех возможных открытых текстов
 */
export function decryptWithPQ(ciphertext: bigint, p: bigint, q: bigint): bigint[] {
  const n = p * q

  // Вычисляем p1, p2, q1, q2 как в Java-примере
  const p1 = modPow(ciphertext, (p + 1n) / FOUR, p)
  const p2 = p - p1
  const q1 = modPow(ciphertext, (q + 1n) / FOUR, q)
  const q2 = q - q1

  // Получаем коэффициенты Безу
  const [, yp, yq] = extendedGCD(p, q)

  // Вычисляем четыре возможных открытых текста
  const d1 = (yp * p * q1 + yq * q * p1) % n
  const d2 = (yp * p * q2 + yq * q * p1) % n
  const d3 = (yp * p * q1 + yq * q * p2) % n
  const d4 = (yp * p * q2 + yq * q * p2) % n

  // Убеждаемся, что все значения положительные
  return [d1 < 0n ? d1 + n : d1, d2 < 0n ? d2 + n : d2, d3 < 0n ? d3 + n : d3, d4 < 0n ? d4 + n : d4]
}

/**
 * Расшифровывает шифротекст с использованием криптосистемы Рабина (формат объекта)
 * @param ciphertext Зашифрованное сообщение
 * @param privateKey Закрытый ключ (p и q)
 * @returns Массив из четырех возможных открытых текстов
 */
export function decrypt(ciphertext: bigint, privateKey: { p: bigint; q: bigint }): bigint[] {
  return decryptWithPQ(ciphertext, privateKey.p, privateKey.q)
}

/**
 * Вспомогательная функция для преобразования строки в BigInt
 */
export function stringToBigInt(str: string): bigint {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  let hex = '0x'
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0')
  }
  return BigInt(hex)
}

/**
 * Вспомогательная функция для преобразования BigInt в строку
 */
export function bigIntToString(bigint: bigint): string {
  const hex = bigint.toString(16)
  // Обеспечиваем четную длину
  const paddedHex = hex.length % 2 ? '0' + hex : hex

  const bytes = new Uint8Array(paddedHex.length / 2)
  for (let i = 0; i < paddedHex.length; i += 2) {
    bytes[i / 2] = parseInt(paddedHex.substring(i, i + 2), 16)
  }

  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}

/**
 * Пример использования криптосистемы Рабина в стиле Java
 */
export function rabinExampleJavaStyle(): void {
  // Генерация пары ключей
  console.log('Генерация пары ключей...')
  const [n, p, q] = generateKey(512)
  console.log(`Открытый ключ (n): ${n}`)
  console.log(`Закрытый ключ (p): ${p}`)
  console.log(`Закрытый ключ (q): ${q}`)

  // Исходное сообщение
  const originalMessage = 'Привет'
  console.log(`\nСообщение отправителя: "${originalMessage}"`)

  // Преобразуем сообщение в BigInt
  const messageBigInt = stringToBigInt(originalMessage)

  // Шифруем сообщение
  const encryptedMessage = encrypt(messageBigInt, n)
  console.log(`Зашифрованное сообщение: ${encryptedMessage}`)

  // Расшифровываем сообщение
  const possibleMessages = decryptWithPQ(encryptedMessage, p, q)

  let finalMessage = null

  for (const value of possibleMessages) {
    try {
      const decryptedString = bigIntToString(value)
      if (decryptedString === originalMessage) {
        finalMessage = decryptedString
        break
      }
    } catch {
      // Недопустимая строка UTF-8
    }
  }

  console.log(`Сообщение получено получателем: ${finalMessage}`)
}

/**
 * Пример использования криптосистемы Рабина
 */
export function rabinExample(): void {
  // Генерация пары ключей
  console.log('Генерация пары ключей...')
  const { publicKey, privateKey } = generateKeyPair(512)
  console.log(`Открытый ключ (n): ${publicKey}`)
  console.log(`Закрытый ключ (p): ${privateKey.p}`)
  console.log(`Закрытый ключ (q): ${privateKey.q}`)

  // Исходное сообщение
  const originalMessage = 'Привет'
  console.log(`\nИсходное сообщение: "${originalMessage}"`)

  // Преобразуем сообщение в BigInt
  const messageBigInt = stringToBigInt(originalMessage)
  console.log(`Сообщение в виде BigInt: ${messageBigInt}`)

  // Шифруем сообщение
  const encryptedMessage = encrypt(messageBigInt, publicKey)
  console.log(`\nЗашифрованное сообщение: ${encryptedMessage}`)

  // Расшифровываем сообщение
  console.log('\nРасшифровка...')
  const possibleMessages = decrypt(encryptedMessage, privateKey)

  console.log('Возможные расшифрованные значения:')
  let foundOriginal = false

  for (let i = 0; i < possibleMessages.length; i++) {
    try {
      const decryptedString = bigIntToString(possibleMessages[i])
      console.log(`Вариант ${i + 1}: ${possibleMessages[i]} -> "${decryptedString}"`)

      if (decryptedString === originalMessage) {
        console.log(`✓ Вариант ${i + 1} соответствует исходному сообщению!`)
        foundOriginal = true
      }
    } catch {
      console.log(`Вариант ${i + 1}: ${possibleMessages[i]} -> [Недопустимая строка UTF-8]`)
    }
  }

  if (!foundOriginal) {
    console.log('❌ Исходное сообщение не найдено среди вариантов расшифровки.')
  }
}
