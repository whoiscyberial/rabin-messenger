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
 * Упрощенная версия для лучшей читаемости
 */
export function generateBlumPrime(bitLength: number): bigint {
  // Простая проверка на простоту (тест Ферма)
  function isProbablePrime(n: bigint): boolean {
    if (n <= 1n) return false
    if (n <= 3n) return true
    if (n % 2n === 0n) return false

    // Тест Ферма с основанием 2
    return modPow(2n, n - 1n, n) === 1n
  }

  // Генерация случайного числа заданной битовой длины
  function generateRandomNumber(bits: number): bigint {
    // Создаем случайное шестнадцатеричное число
    let hex = '0x'
    for (let i = 0; i < Math.ceil(bits / 4); i++) {
      hex += Math.floor(Math.random() * 16).toString(16)
    }

    let num = BigInt(hex)
    // Делаем число нечетным
    if (num % 2n === 0n) num += 1n
    return num
  }

  // Ищем простое число, которое при делении на 4 дает остаток 3
  let prime: bigint
  do {
    // Генерируем случайное число и проверяем его на простоту
    let candidate: bigint
    do {
      candidate = generateRandomNumber(bitLength)
    } while (!isProbablePrime(candidate))

    prime = candidate
  } while (prime % 4n !== 3n)

  return prime
}

/**
 * Генерирует пару ключей для криптосистемы Рабина
 */
export function generateKey(bitLength: number = 512): [bigint, bigint, bigint] {
  const p = generateBlumPrime(bitLength / 2)
  const q = generateBlumPrime(bitLength / 2)
  const n = p * q
  return [n, p, q]
}

/**
 * Генерирует пару ключей для криптосистемы Рабина (формат объекта)
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
  if (p % 4n !== 3n || q % 4n !== 3n) {
    throw new Error('Оба числа p и q должны быть сравнимы с 3 по модулю 4')
  }
  const n = p * q
  return { publicKey: n, privateKey: { p, q } }
}

/**
 * Шифрует сообщение с использованием криптосистемы Рабина
 * Упрощенная версия - просто возводим в квадрат по модулю n
 */
export function encrypt(message: bigint, publicKey: bigint): bigint {
  return (message * message) % publicKey
}

/**
 * Расширенный алгоритм Евклида для нахождения НОД и коэффициентов Безу
 * Упрощенная версия с более понятными именами переменных
 */
export function extendedGCD(a: bigint, b: bigint): [bigint, bigint, bigint] {
  let remainder_old = a
  let remainder_new = b
  let bezout_a_old = 1n
  let bezout_a_new = 0n
  let bezout_b_old = 0n
  let bezout_b_new = 1n

  while (remainder_new !== 0n) {
    const quotient = remainder_old / remainder_new

    // Обновляем остатки
    const temp_remainder = remainder_new
    remainder_new = remainder_old - quotient * remainder_new
    remainder_old = temp_remainder

    // Обновляем коэффициенты Безу для a
    const temp_bezout_a = bezout_a_new
    bezout_a_new = bezout_a_old - quotient * bezout_a_new
    bezout_a_old = temp_bezout_a

    // Обновляем коэффициенты Безу для b
    const temp_bezout_b = bezout_b_new
    bezout_b_new = bezout_b_old - quotient * bezout_b_new
    bezout_b_old = temp_bezout_b
  }

  return [remainder_old, bezout_a_old, bezout_b_old] // [gcd, x, y]
}

/**
 * Расшифровывает шифротекст с использованием криптосистемы Рабина
 * Упрощенная версия с более понятными именами переменных
 */
export function decryptWithPQ(ciphertext: bigint, p: bigint, q: bigint): bigint[] {
  const n = p * q

  // Вычисляем квадратные корни по модулю p и q
  const mp = (p + 1n) / 4n // Показатель степени для p
  const mq = (q + 1n) / 4n // Показатель степени для q

  const root_p_1 = modPow(ciphertext, mp, p)
  const root_p_2 = p - root_p_1
  const root_q_1 = modPow(ciphertext, mq, q)
  const root_q_2 = q - root_q_1

  // Получаем коэффициенты Безу: yp*p + yq*q = 1
  const [, yp, yq] = extendedGCD(p, q)

  // Комбинируем корни, используя Китайскую теорему об остатках
  // Формула: (yp * p * root_q + yq * q * root_p) % n
  const plaintext1 = (yp * p * root_q_1 + yq * q * root_p_1) % n
  const plaintext2 = (yp * p * root_q_2 + yq * q * root_p_1) % n
  const plaintext3 = (yp * p * root_q_1 + yq * q * root_p_2) % n
  const plaintext4 = (yp * p * root_q_2 + yq * q * root_p_2) % n

  // Убеждаемся, что все значения положительные
  const makePositive = (x: bigint) => (x < 0n ? x + n : x)

  return [makePositive(plaintext1), makePositive(plaintext2), makePositive(plaintext3), makePositive(plaintext4)]
}

/**
 * Расшифровывает шифротекст с использованием криптосистемы Рабина (формат объекта)
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

  // Преобразуем байты в шестнадцатеричную строку
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
  // Преобразуем BigInt в шестнадцатеричную строку
  let hex = bigint.toString(16)

  // Добавляем ведущий ноль, если длина нечетная
  if (hex.length % 2 !== 0) {
    hex = '0' + hex
  }

  // Преобразуем шестнадцатеричную строку в массив байтов
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }

  // Преобразуем байты в строку
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}
