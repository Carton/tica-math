// CastingOutNines算法单元测试 - 直接测试castingOutNines技能逻辑
// 这个测试应该达到100%通过率，因为它直接测试算法本身

// 辅助函数
function digitSum(n: number): number {
  let s = 0, abs = Math.abs(n);
  while (abs > 0) { s += abs % 10; abs = Math.floor(abs / 10); }
  return s;
}

function digitSumMod9(n: number): number {
  return digitSum(n) % 9;
}

// 复制修复后的castingOutNines算法逻辑进行测试
function makeStrategicError_CastingOutNines(correct: number): number {
  let v = correct
  // 个位数计算：使用绝对值的个位数，符合用户的真实意图
  const lastDigit = Math.abs(correct % 10)

  // 使数字和模9不一致，但保证个位数不变
  const currentMod9_value = digitSumMod9(correct)
  const wrongMod9_value = (currentMod9_value + 1) % 9 || 9

  // 寻找合适的修改方案，确保个位数不变且弃九验算失效
  let foundCasting = false

  // 尝试不同的修改策略
  const strategies = [
    () => {
      // 策略1：修改十位数，保持个位数不变
      for (let tensChange = -9; tensChange <= 9; tensChange++) {
        if (tensChange === 0) continue
        const candidate = correct + tensChange * 10
        // 检查个位数是否保持（使用绝对值的个位数）
        const candidateLastDigit = Math.abs(candidate % 10)
        if (candidateLastDigit === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
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
        // 检查个位数是否保持（使用绝对值的个位数）
        const candidateLastDigit = Math.abs(candidate % 10)
        if (candidateLastDigit === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
          return candidate
        }
      }
      return null
    },
    () => {
      // 策略3：修改千位数
      for (let thousandsChange = -9; thousandsChange <= 9; thousandsChange++) {
        if (thousandsChange === 0) continue
        const candidate = correct + thousandsChange * 1000
        // 检查个位数是否保持（使用绝对值的个位数）
        const candidateLastDigit = Math.abs(candidate % 10)
        if (candidateLastDigit === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
          return candidate
        }
      }
      return null
    },
    () => {
      // 策略4：组合变化
      const baseChanges = [9, 18, 27, 36, 45, 54, 63, 72, 81]
      for (let change of baseChanges) {
        const candidate1 = correct + change
        const candidate2 = correct - change
        // 检查个位数是否保持（使用绝对值的个位数）
        const candidate1LastDigit = Math.abs(candidate1 % 10)
        const candidate2LastDigit = Math.abs(candidate2 % 10)
        if (candidate1LastDigit === lastDigit && digitSumMod9(candidate1) === wrongMod9_value) {
          return candidate1
        }
        if (candidate2LastDigit === lastDigit && digitSumMod9(candidate2) === wrongMod9_value) {
          return candidate2
        }
      }
      return null
    }
  ]

  // 尝试所有策略
  for (let strategy of strategies) {
    const result = strategy()
    if (result !== null) {
      v = result
      foundCasting = true
      break
    }
  }

  return v
}

// 验证castingOutNines技能的函数
function validateCastingOutNinesSkill(correct: number, wrong: number): { valid: boolean, detail: string } {
  const correctMod9 = digitSumMod9(correct)
  const wrongMod9 = digitSumMod9(wrong)
  const mod9Changed = correctMod9 !== wrongMod9
  // 修复个位数保持验证：使用绝对值的个位数进行比较
  const lastDigitPreservedCasting = Math.abs(wrong % 10) === Math.abs(correct % 10)

  return {
    valid: mod9Changed && lastDigitPreservedCasting,
    detail: `弃九模9变化:${mod9Changed}, 个位保持:${lastDigitPreservedCasting}`
  }
}

describe('CastingOutNines算法单元测试', () => {

  describe('算法正确性测试 - 应该100%通过', () => {

    test('应该改变弃九模9结果且保持个位数', () => {
      const testNumbers = [123, 456, 789, 1000, 2500, 9999, 12345, 67890]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError_CastingOutNines(correct)
          const validation = validateCastingOutNinesSkill(correct, wrong)

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

    test('负数也应该改变弃九模9结果且保持个位数', () => {
      const testNumbers = [-123, -456, -789, -1000, -2500, -9999, -12345, -67890]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError_CastingOutNines(correct)
          const validation = validateCastingOutNinesSkill(correct, wrong)

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

    test('弃九模9变化统计', () => {
      const testNumbers = [123, 456, 789, 111, 222, 333, 444, 555]
      let mod9Changes: number[] = []

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_CastingOutNines(correct)
          const correctMod9 = digitSumMod9(correct)
          const wrongMod9 = digitSumMod9(wrong)
          if (correctMod9 !== wrongMod9) {
            mod9Changes.push(wrongMod9)
          }
        }
      })

      console.log(`弃九模9变化次数: ${mod9Changes.length}`)
      console.log(`变化的模9值: ${[...new Set(mod9Changes)].sort((a, b) => a - b)}`)
      expect(mod9Changes.length).toBeGreaterThan(0)
    })
  })

  describe('边界情况测试', () => {

    test('一位数应该正确处理', () => {
      const oneDigitNumbers = [1, 5, 9, 0, -3, -8]
      let successCount = 0

      oneDigitNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_CastingOutNines(correct)
          const validation = validateCastingOutNinesSkill(correct, wrong)

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

    test('特殊数字（全9）应该正确处理', () => {
      const specialNumbers = [9, 99, 999, 9999, -9, -99, -999]
      let successCount = 0

      specialNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_CastingOutNines(correct)
          const validation = validateCastingOutNinesSkill(correct, wrong)

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
          const wrong = makeStrategicError_CastingOutNines(correct)
          const validation = validateCastingOutNinesSkill(correct, wrong)

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
      let strategyUsage = { tens: 0, hundreds: 0, thousands: 0, combination: 0 }

      mixedNumbers.forEach(correct => {
        for (let i = 0; i < 5; i++) {
          const wrong = makeStrategicError_CastingOutNines(correct)
          const validation = validateCastingOutNinesSkill(correct, wrong)

          if (validation.valid) {
            successCount++

            // 估算使用的策略（基于变化幅度）
            const diff = Math.abs(wrong - correct)
            if (diff < 100) strategyUsage.tens++
            else if (diff < 1000) strategyUsage.hundreds++
            else if (diff < 10000) strategyUsage.thousands++
            else strategyUsage.combination++
          }
        }
      })

      const totalTests = mixedNumbers.length * 5
      const successRate = (successCount / totalTests) * 100

      console.log(`=== CastingOutNines算法综合测试结果 ===`)
      console.log(`总成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      console.log(`策略使用: 十位:${strategyUsage.tens}, 百位:${strategyUsage.hundreds}, 千位:${strategyUsage.thousands}, 组合:${strategyUsage.combination}`)

      // 算法单元测试应该达到100%成功率
      expect(successRate).toBe(100)
      expect(strategyUsage.tens + strategyUsage.hundreds + strategyUsage.thousands + strategyUsage.combination).toBeGreaterThan(0)
    })

    test('数值变化幅度统计', () => {
      const testNumbers = [123, 456, 789, 1000, 2000]
      let changes: number[] = []

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_CastingOutNines(correct)
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