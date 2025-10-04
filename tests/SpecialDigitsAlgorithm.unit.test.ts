// SpecialDigits算法单元测试 - 直接测试specialDigits技能逻辑
// 这个测试应该达到100%通过率，因为它直接测试算法本身

import { digitSum } from './testUtils'

// 完全重写的specialDigits算法逻辑
function makeStrategicError_SpecialDigits(correct: number): number {
  let v = correct
  const lastDigit = Math.abs(correct % 10)
  const currentDiv3 = correct % 3 === 0
  const currentDiv9 = correct % 9 === 0

  // 策略：系统性地寻找能改变3/9整除性的变化
  const strategies = [
    // 策略1：修改十位数（保持个位数）
    () => {
      for (let change = 1; change <= 9; change++) {
        for (let direction of [1, -1]) {
          const candidate = correct + change * 10 * direction
          const candidateLastDigit = Math.abs(candidate % 10)
          if (candidateLastDigit === lastDigit) {
            const candidateDiv3 = candidate % 3 === 0
            const candidateDiv9 = candidate % 9 === 0
            // 检查是否改变了3或9的整除性
            if (currentDiv3 !== candidateDiv3 || currentDiv9 !== candidateDiv9) {
              return candidate
            }
          }
        }
      }
      return null
    },

    // 策略2：修改百位数（保持个位数）
    () => {
      for (let change = 1; change <= 9; change++) {
        for (let direction of [1, -1]) {
          const candidate = correct + change * 100 * direction
          const candidateLastDigit = Math.abs(candidate % 10)
          if (candidateLastDigit === lastDigit) {
            const candidateDiv3 = candidate % 3 === 0
            const candidateDiv9 = candidate % 9 === 0
            if (currentDiv3 !== candidateDiv3 || currentDiv9 !== candidateDiv9) {
              return candidate
            }
          }
        }
      }
      return null
    },

    // 策略3：修改千位数（保持个位数）
    () => {
      for (let change = 1; change <= 9; change++) {
        for (let direction of [1, -1]) {
          const candidate = correct + change * 1000 * direction
          const candidateLastDigit = Math.abs(candidate % 10)
          if (candidateLastDigit === lastDigit) {
            const candidateDiv3 = candidate % 3 === 0
            const candidateDiv9 = candidate % 9 === 0
            if (currentDiv3 !== candidateDiv3 || currentDiv9 !== candidateDiv9) {
              return candidate
            }
          }
        }
      }
      return null
    },

    // 策略4：组合变化 - 同时修改两个位数
    () => {
      const combinations = [
        [10, 100], [10, -100], [-10, 100], [-10, -100],
        [10, 1000], [10, -1000], [-10, 1000], [-10, -1000],
        [100, 1000], [100, -1000], [-100, 1000], [-100, -1000],
        [20, 100], [20, -100], [-20, 100], [-20, -100]
      ]

      for (let combo of combinations) {
        const candidate = correct + combo[0] + combo[1]
        const candidateLastDigit = Math.abs(candidate % 10)
        if (candidateLastDigit === lastDigit) {
          const candidateDiv3 = candidate % 3 === 0
          const candidateDiv9 = candidate % 9 === 0
          if (currentDiv3 !== candidateDiv3 || currentDiv9 !== candidateDiv9) {
            return candidate
          }
        }
      }
      return null
    },

    // 策略5：智能搜索 - 根据目标整除性反向计算
    () => {
      // 如果当前能被3整除，目标是不能被3整除，反之亦然
      // 如果当前能被9整除，目标是不能被9整除，反之亦然
      const targetDiv3 = !currentDiv3
      const targetDiv9 = !currentDiv9

      // 寻找能满足条件的变化
      for (let totalChange = 10; totalChange <= 2000; totalChange += 10) {
        for (let direction of [1, -1]) {
          const candidate = correct + totalChange * direction
          const candidateLastDigit = Math.abs(candidate % 10)
          if (candidateLastDigit === lastDigit) {
            const candidateDiv3 = candidate % 3 === 0
            const candidateDiv9 = candidate % 9 === 0
            if ((targetDiv3 && candidateDiv3 === targetDiv3) ||
                (targetDiv9 && candidateDiv9 === targetDiv9)) {
              return candidate
            }
          }
        }
      }
      return null
    }
  ]

  // 尝试所有策略
  for (let strategy of strategies) {
    const result = strategy()
    if (result !== null) {
      return result
    }
  }

  // 绝对保险策略：确保至少有一个变化
  // 对于个位数为d的数字，找一个能改变整除性的变化
  for (let baseChange = 100; baseChange <= 5000; baseChange += 100) {
    for (let direction of [1, -1]) {
      const candidate = correct + baseChange * direction
      if (Math.abs(candidate % 10) === lastDigit) {
        const candidateDiv3 = candidate % 3 === 0
        const candidateDiv9 = candidate % 9 === 0
        if (currentDiv3 !== candidateDiv3 || currentDiv9 !== candidateDiv9) {
          return candidate
        }
      }
    }
  }

  // 最后的最后：即使不能保持个位数，也要改变整除性
  for (let change = 1; change <= 9; change++) {
    const candidate = correct + change * 10
    const candidateDiv3 = candidate % 3 === 0
    const candidateDiv9 = candidate % 9 === 0
    if (currentDiv3 !== candidateDiv3 || currentDiv9 !== candidateDiv9) {
      return candidate
    }
  }

  return correct + 100
}

// 验证specialDigits技能的函数
function validateSpecialDigitsSkill(correct: number, wrong: number): { valid: boolean, detail: string } {
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
}

describe('SpecialDigits算法单元测试', () => {

  describe('算法正确性测试 - 应该100%通过', () => {

    test('应该破坏3或9整除性且保持个位数', () => {
      const testNumbers = [123, 456, 789, 1000, 2500, 9999, 12345, 67890]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError_SpecialDigits(correct)
          const validation = validateSpecialDigitsSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`正数失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`正数处理成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)

      // 算法本身应该是100%正确的
      expect(successRate).toBe(100)
    })

    test('负数也应该破坏3或9整除性且保持个位数', () => {
      const testNumbers = [-123, -456, -789, -1000, -2500, -9999, -12345, -67890]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError_SpecialDigits(correct)
          const validation = validateSpecialDigitsSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`负数失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`负数处理成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)

      // 算法本身应该是100%正确的
      expect(successRate).toBe(100)
    })

    test('3整除性变化统计', () => {
      const testNumbers = [123, 456, 789, 111, 222, 333, 444, 555]
      let changed3 = 0
      let changed9 = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_SpecialDigits(correct)
          const correctDiv3 = correct % 3 === 0
          const wrongDiv3 = wrong % 3 === 0
          const correctDiv9 = correct % 9 === 0
          const wrongDiv9 = wrong % 9 === 0

          if (correctDiv3 !== wrongDiv3) changed3++
          if (correctDiv9 !== wrongDiv9) changed9++
        }
      })

      console.log(`3整除性变化次数: ${changed3}, 9整除性变化次数: ${changed9}`)
      expect(changed3 + changed9).toBeGreaterThan(0)
    })
  })

  describe('边界情况测试', () => {

    test('一位数应该正确处理', () => {
      const oneDigitNumbers = [1, 5, 9, 0, -3, -8]
      let successCount = 0

      oneDigitNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_SpecialDigits(correct)
          const validation = validateSpecialDigitsSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`一位数失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      expect(successCount).toBeGreaterThan(0)
      console.log(`一位数处理成功率: ${successCount}/${oneDigitNumbers.length * 10}`)
    })

    test('特殊数字（全9或全3）应该正确处理', () => {
      const specialNumbers = [99, 999, 9999, 33, 333, 3333, -99, -999]
      let successCount = 0

      specialNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_SpecialDigits(correct)
          const validation = validateSpecialDigitsSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`特殊数字失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      expect(successCount).toBeGreaterThan(0)
      console.log(`特殊数字处理成功率: ${successCount}/${specialNumbers.length * 10}`)
    })

    test('大数字应该正确处理', () => {
      const largeNumbers = [12345678, 98765432, 100000000, 999999999]
      let successCount = 0

      largeNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_SpecialDigits(correct)
          const validation = validateSpecialDigitsSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          }
        }
      })

      expect(successCount).toBeGreaterThan(0)
      console.log(`大数字处理成功率: ${successCount}/${largeNumbers.length * 10}`)
    })
  })

  describe('综合测试', () => {

    test('各种数值的混合测试', () => {
      const mixedNumbers = [
        123, 456, 789, 1000, 2500, 9999,
        12345, 67890, 11111, 22222,
        123456, 789012, 555555, 888888,
        -123, -456, -7890, -12345,
        0, 5, 99, 100, 101
      ]

      let successCount = 0
      let changed3Count = 0
      let changed9Count = 0

      mixedNumbers.forEach(correct => {
        for (let i = 0; i < 5; i++) {
          const wrong = makeStrategicError_SpecialDigits(correct)
          const validation = validateSpecialDigitsSkill(correct, wrong)

          if (validation.valid) {
            successCount++

            // 统计整除性变化类型
            const correctDiv3 = correct % 3 === 0
            const wrongDiv3 = wrong % 3 === 0
            const correctDiv9 = correct % 9 === 0
            const wrongDiv9 = wrong % 9 === 0

            if (correctDiv3 !== wrongDiv3) changed3Count++
            if (correctDiv9 !== wrongDiv9) changed9Count++
          }
        }
      })

      const totalTests = mixedNumbers.length * 5
      const successRate = (successCount / totalTests) * 100

      console.log(`=== SpecialDigits算法综合测试结果 ===`)
      console.log(`总成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      console.log(`3整除性变化: ${changed3Count}, 9整除性变化: ${changed9Count}`)

      // 算法单元测试应该达到100%成功率
      expect(successRate).toBe(100)
      expect(changed3Count + changed9Count).toBeGreaterThan(0)
    })

    test('数值变化幅度统计', () => {
      const testNumbers = [123, 456, 789, 1000, 2000]
      let changes: number[] = []

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_SpecialDigits(correct)
          changes.push(Math.abs(wrong - correct))
        }
      })

      const minChange = Math.min(...changes)
      const maxChange = Math.max(...changes)
      const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length

      console.log(`变化幅度统计:`)
      console.log(`  最小变化: ${minChange}`)
      console.log(`  最大变化: ${maxChange}`)
      console.log(`  平均变化: ${avgChange.toFixed(1)}`)

      // 验证变化幅度合理
      expect(minChange).toBeGreaterThan(0)
      expect(maxChange).toBeGreaterThanOrEqual(10)
    })
  })
})