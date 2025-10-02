// 所有技能算法单元测试 - 根据真实要求修正验证逻辑
// 这些测试应该达到100%通过率

// 从代码中复制的算法实现（完全不变）
function makeStrategicError(correct: number, skill: string, allowNegative: boolean = false): number {
  let v = correct
  const lastDigit = correct % 10
  const absCorrect = Math.abs(correct)

  switch (skill) {
    case 'lastDigit':
      // 只修改个位数，在±5范围内（排除0）
      let lastDigitChange
      do {
        lastDigitChange = Math.floor(Math.random() * 11) - 5 // -5 到 5
      } while (lastDigitChange === 0)
      v = correct + lastDigitChange
      break

    case 'estimate':
      // 估算错误：首位±1（50%）或者中间位数插入/删除（50%）
      if (Math.random() < 0.5) {
        // 方案1：在最高位上±1
        const digits = absCorrect.toString().length
        if (digits >= 2) {
          const highestPlace = Math.pow(10, digits - 1)
          let change
          do {
            change = Math.floor(Math.random() * 3) - 1 // -1 到 1，排除0
          } while (change === 0)
          v = correct + change * highestPlace
        } else {
          let change
          do {
            change = Math.floor(Math.random() * 3) - 1 // -1 到 1，排除0
          } while (change === 0)
          v = correct + change
        }
      } else {
        // 方案2：在中间插入或删除一个数字
        const digits = absCorrect.toString().length
        const correctStr = absCorrect.toString()

        if (Math.random() < 0.5) {
          // 插入一个数字
          if (digits >= 2) {
            const insertPos = Math.floor(Math.random() * (digits - 1)) + 1 // 1到digits-1位（不在首位插入）
            const insertDigit = Math.floor(Math.random() * 10) // 0-9
            const newStr = correctStr.slice(0, insertPos) + insertDigit + correctStr.slice(insertPos)
            v = parseInt(newStr) * (correct < 0 ? -1 : 1)
          } else {
            // 一位数，简单在后面加一位
            const insertDigit = Math.floor(Math.random() * 10)
            v = parseInt(correctStr + insertDigit) * (correct < 0 ? -1 : 1)
          }
        } else {
          // 删除一个数字
          if (digits >= 3) {
            const deletePos = Math.floor(Math.random() * (digits - 1)) + 1 // 1到digits-1位（不删除首位）
            const newStr = correctStr.slice(0, deletePos) + correctStr.slice(deletePos + 1)
            v = parseInt(newStr) * (correct < 0 ? -1 : 1)
          } else if (digits === 2) {
            // 两位数，删除第二位
            v = parseInt(correctStr[0]) * (correct < 0 ? -1 : 1)
          } else {
            // 一位数，只能变成0
            v = 0
          }
        }
      }
      // 保持个位数正确
      v = Math.floor(v / 10) * 10 + lastDigit
      break

    case 'carryBorrow':
      // 个位正确但十位错误，通常是±10, ±20等
      const carryError = (Math.random() < 0.5 ? 10 : 20) * (Math.random() < 0.5 ? 1 : -1)
      v = correct + carryError
      break

    case 'specialDigits':
      // 破坏3或9的整除性，但不修改个位数，支持更大的数值变化
      const currentSum = digitSum(correct)
      const targetMod3 = (currentSum % 3 + 1) % 3 // 确保不被3整除
      const targetMod9 = (currentSum % 9 + 1) % 9 // 确保不被9整除
      const modTarget = Math.random() < 0.7 ? targetMod3 : targetMod9

      // 支持更大的数值变化：±10, ±100, ±1000等
      const magnitudes = [10, 100, 1000]
      let found = false

      for (let attempt = 0; attempt < 50 && !found; attempt++) {
        const magnitude = magnitudes[Math.floor(Math.random() * magnitudes.length)]
        for (let i = 1; i <= magnitude / 10 && i <= 100; i++) {
          const testDiff = i * magnitude * (Math.random() < 0.5 ? 1 : -1)
          const candidate = correct + testDiff
          if (candidate % 10 === lastDigit) {
            const candidateSum = digitSum(candidate)
            if ((modTarget === targetMod3 && candidateSum % 3 !== currentSum % 3) ||
                (modTarget === targetMod9 && candidateSum % 9 !== currentSum % 9)) {
              v = candidate
              found = true
              break
            }
          }
        }
      }

      if (!found) {
        for (let attempt = 0; attempt < 20 && !found; attempt++) {
          const largeChange = (Math.random() < 0.5 ? 1 : -1) * (5000 + Math.floor(Math.random() * 5000))
          const candidate = correct + largeChange
          if (candidate % 10 === lastDigit) {
            const candidateSum = digitSum(candidate)
            if ((modTarget === targetMod3 && candidateSum % 3 !== currentSum % 3) ||
                (modTarget === targetMod9 && candidateSum % 9 !== currentSum % 9)) {
              v = candidate
              found = true
            }
          }
        }
      }

      if (!found) {
        const diff = 100 * (Math.random() < 0.5 ? 1 : -1)
        v = correct + diff
      }
      break

    case 'castingOutNines':
      // 使数字和模9不一致，但保证个位数不变
      const currentMod9_value = digitSumMod9(correct)
      const wrongMod9_value = (currentMod9_value + 1) % 9 || 9

      let foundCasting = false
      const strategies = [
        () => {
          // 策略1：修改十位数，保持个位数不变
          for (let tensChange = -9; tensChange <= 9; tensChange++) {
            if (tensChange === 0) continue
            const candidate = correct + tensChange * 10
            if (candidate % 10 === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
              return candidate
            }
          }
          return null
        },
        () => {
          // 策略2：修改百位数
          for (let hundredsChange = -9; hundredsChange <= 9; hundredsChange++) {
            if (hundredsChange === 0) continue
            const candidate = correct + hundredsChange * 100
            if (candidate % 10 === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
              return candidate
            }
          }
          return null
        }
      ]

      for (let strategy of strategies) {
        const result = strategy()
        if (result !== null) {
          v = result
          foundCasting = true
          break
        }
      }

      if (!foundCasting) {
        let finalCandidate = correct + 90
        if (finalCandidate % 10 !== lastDigit) {
          finalCandidate = Math.floor(finalCandidate / 10) * 10 + lastDigit
        }
        v = finalCandidate
      }
      break

    default:
      v = correct + 1
  }

  if (!allowNegative && v < 0) v = Math.abs(v)
  return v
}

// 辅助函数
function digitSum(n: number): number {
  let s = 0, abs = Math.abs(n);
  while (abs > 0) { s += abs % 10; abs = Math.floor(abs / 10); }
  return s;
}

function digitSumMod9(n: number): number {
  return digitSum(n) % 9;
}

// 根据你的澄清要求修正验证逻辑
function validateSkillAlgorithm(correct: number, wrong: number, skill: string): { valid: boolean, detail: string } {
  switch (skill) {
    case 'lastDigit':
      // 要求：给数值加减-5到+5，允许影响其他位数
      const difference = wrong - correct
      const validRange = difference >= -5 && difference <= 5 && difference !== 0

      return {
        valid: validRange,
        detail: `数值变化: ${difference}, 范围内:${validRange}`
      }

    case 'estimate':
      const correctDigits = Math.abs(correct).toString().length
      const wrongDigits = Math.abs(wrong).toString().length
      const correctHighest = Math.floor(Math.abs(correct) / Math.pow(10, correctDigits - 1))
      const wrongHighest = Math.floor(Math.abs(wrong) / Math.pow(10, wrongDigits - 1))
      const validEstimate = correctDigits !== wrongDigits || correctHighest !== wrongHighest
      // 修复个位数保持验证：使用绝对值的个位数进行比较
      const lastDigitPreserved = Math.abs(wrong % 10) === Math.abs(correct % 10)

      return {
        valid: validEstimate && lastDigitPreserved,
        detail: `位数/首位变化:${validEstimate}, 个位保持:${lastDigitPreserved}`
      }

    case 'carryBorrow':
      // 要求：数值加减±10或±20
      const carryDiff = wrong - correct
      const validCarryDiff = (Math.abs(carryDiff) === 10 || Math.abs(carryDiff) === 20)

      return {
        valid: validCarryDiff,
        detail: `数值变化: ${carryDiff}, 有效:${validCarryDiff}`
      }

    case 'specialDigits':
      const correctDiv3 = correct % 3 === 0
      const wrongDiv3 = wrong % 3 === 0
      const correctDiv9 = correct % 9 === 0
      const wrongDiv9 = wrong % 9 === 0
      const divisibilityChanged = (correctDiv3 !== wrongDiv3) || (correctDiv9 !== wrongDiv9)
      // 修复个位数保持验证：使用绝对值的个位数进行比较
      const lastDigitPreservedSpecial = Math.abs(wrong % 10) === Math.abs(correct % 10)

      return {
        valid: divisibilityChanged && lastDigitPreservedSpecial,
        detail: `3/9整除性变化:${divisibilityChanged}, 个位保持:${lastDigitPreservedSpecial}`
      }

    case 'castingOutNines':
      const correctMod9 = digitSumMod9(correct)
      const wrongMod9 = digitSumMod9(wrong)
      const mod9Changed = correctMod9 !== wrongMod9
      // 修复个位数保持验证：使用绝对值的个位数进行比较
      const lastDigitPreservedCasting = Math.abs(wrong % 10) === Math.abs(correct % 10)

      return {
        valid: mod9Changed && lastDigitPreservedCasting,
        detail: `弃九模9变化:${mod9Changed}, 个位保持:${lastDigitPreservedCasting}`
      }

    default:
      return { valid: false, detail: `未知技能: ${skill}` }
  }
}

describe('所有技能算法单元测试（修正版）', () => {
  const testNumbers = [
    123, 456, 789, 1000, 2500, 9999,
    12345, 67890, 11111, 22222,
    -123, -456, -7890, -12345,
    0, 5, 10, 99, 100, 101
  ]

  describe('lastDigit 技能算法测试', () => {
    test('给数值加减-5到+5', () => {
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError(correct, 'lastDigit')
          const validation = validateSkillAlgorithm(correct, wrong, 'lastDigit')

          if (validation.valid) {
            successCount++
          } else {
            console.log(`lastDigit失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`lastDigit成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      expect(successRate).toBe(100)
    })
  })

  describe('estimate 技能算法测试', () => {
    test('首位或位数变化且个位数保持', () => {
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError(correct, 'estimate')
          const validation = validateSkillAlgorithm(correct, wrong, 'estimate')

          if (validation.valid) {
            successCount++
          } else {
            console.log(`estimate失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`estimate成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      expect(successRate).toBe(100)
    })
  })

  describe('carryBorrow 技能算法测试', () => {
    test('数值加减±10或±20', () => {
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError(correct, 'carryBorrow')
          const validation = validateSkillAlgorithm(correct, wrong, 'carryBorrow')

          if (validation.valid) {
            successCount++
          } else {
            console.log(`carryBorrow失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`carryBorrow成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      expect(successRate).toBe(100)
    })
  })

  describe('specialDigits 技能算法测试', () => {
    test('破坏3/9整除性且保持个位数', () => {
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError(correct, 'specialDigits')
          const validation = validateSkillAlgorithm(correct, wrong, 'specialDigits')

          if (validation.valid) {
            successCount++
          } else {
            console.log(`specialDigits失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`specialDigits成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      expect(successRate).toBe(100)
    })
  })

  describe('castingOutNines 技能算法测试', () => {
    test('改变弃九模9结果且保持个位数', () => {
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError(correct, 'castingOutNines')
          const validation = validateSkillAlgorithm(correct, wrong, 'castingOutNines')

          if (validation.valid) {
            successCount++
          } else {
            console.log(`castingOutNines失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`castingOutNines成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      expect(successRate).toBe(100)
    })
  })
})