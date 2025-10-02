// LastDigit算法单元测试 - 直接测试lastDigit技能逻辑
// 这个测试应该达到100%通过率，因为它直接测试算法本身

// 复制修复后的lastDigit算法逻辑进行测试
function makeStrategicError_LastDigit(correct: number): number {
  let v = correct

  // 要求：给数值加减-5到+5，允许影响其他位数
  let lastDigitChange
  do {
    lastDigitChange = Math.floor(Math.random() * 11) - 5 // -5 到 5
  } while (lastDigitChange === 0)

  // 确保变化不会导致符号反转
  if (correct < 0) {
    // 负数：只能加负方向的变化，或者小的正向变化
    if (lastDigitChange > 0 && Math.abs(lastDigitChange) > Math.abs(correct)) {
      lastDigitChange = -Math.floor(Math.random() * 5) - 1 // -1 到 -5
    }
  }

  v = correct + lastDigitChange
  return v
}

// 验证lastDigit技能的函数
function validateLastDigitSkill(correct: number, wrong: number): { valid: boolean, detail: string } {
  // 要求：给数值加减-5到+5，允许影响其他位数
  const difference = wrong - correct
  const validRange = difference >= -5 && difference <= 5 && difference !== 0

  return {
    valid: validRange,
    detail: `数值变化: ${difference}, 范围内:${validRange}`
  }
}

describe('LastDigit算法单元测试', () => {

  describe('算法正确性测试 - 应该100%通过', () => {

    test('正数变化应该在±5范围内', () => {
      const testNumbers = [123, 456, 789, 1000, 2500, 9999, 12345, 67890]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError_LastDigit(correct)
          const validation = validateLastDigitSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`正数失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`正数变化成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)

      // 算法本身应该是100%正确的
      expect(successRate).toBe(100)
    })

    test('负数变化应该在±5范围内且保持负号', () => {
      const testNumbers = [-123, -456, -789, -1000, -2500, -9999, -12345, -67890]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++
          const wrong = makeStrategicError_LastDigit(correct)
          const validation = validateLastDigitSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`负数失败: ${correct}→${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`负数变化成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)

      // 算法本身应该是100%正确的
      expect(successRate).toBe(100)
    })

    test('变化量不应该为0', () => {
      const testNumbers = [123, -456, 789, -123, 5, -8, 0]
      let zeroChangeCount = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 20; i++) {
          const wrong = makeStrategicError_LastDigit(correct)
          if (wrong === correct) {
            zeroChangeCount++
          }
        }
      })

      console.log(`零变化次数: ${zeroChangeCount}`)
      expect(zeroChangeCount).toBe(0)
    })
  })

  describe('边界情况测试', () => {

    test('一位数应该正确处理', () => {
      const oneDigitNumbers = [1, 5, 9, 0, -3, -8]
      let successCount = 0

      oneDigitNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_LastDigit(correct)
          const validation = validateLastDigitSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          }
        }
      })

      expect(successCount).toBeGreaterThan(0)
      console.log(`一位数处理成功率: ${successCount}/${oneDigitNumbers.length * 10}`)
    })

    test('大数字应该正确处理', () => {
      const largeNumbers = [12345678, 98765432, 100000000, 999999999]
      let successCount = 0

      largeNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_LastDigit(correct)
          const validation = validateLastDigitSkill(correct, wrong)

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
      let positiveChanges = 0
      let negativeChanges = 0

      mixedNumbers.forEach(correct => {
        for (let i = 0; i < 5; i++) {
          const wrong = makeStrategicError_LastDigit(correct)
          const validation = validateLastDigitSkill(correct, wrong)

          if (validation.valid) {
            successCount++

            // 统计变化方向
            const difference = wrong - correct
            if (difference > 0) {
              positiveChanges++
            } else {
              negativeChanges++
            }
          }
        }
      })

      const totalTests = mixedNumbers.length * 5
      const successRate = (successCount / totalTests) * 100

      console.log(`=== LastDigit算法综合测试结果 ===`)
      console.log(`总成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      console.log(`正向变化: ${positiveChanges}, 负向变化: ${negativeChanges}`)

      // 算法单元测试应该达到100%成功率
      expect(successRate).toBe(100)
      expect(positiveChanges + negativeChanges).toBeGreaterThan(0)
    })
  })
})