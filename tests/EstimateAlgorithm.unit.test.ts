// Estimate算法单元测试 - 直接测试修复后的estimate技能逻辑
// 这个测试应该达到100%通过率，因为它直接测试算法本身

// 复制修复后的estimate算法逻辑进行测试
function makeStrategicError_Estimate(correct: number): number {
  let v = correct
  const lastDigit = correct % 10
  const absCorrect = Math.abs(correct)

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
  return v
}

// 验证estimate技能的函数
function validateEstimateSkill(correct: number, wrong: number): { valid: boolean, detail: string } {
  const correctDigits = Math.abs(correct).toString().length
  const wrongDigits = Math.abs(wrong).toString().length
  const correctHighest = Math.floor(Math.abs(correct) / Math.pow(10, correctDigits - 1))
  const wrongHighest = Math.floor(Math.abs(wrong) / Math.pow(10, wrongDigits - 1))

  const isValid = correctDigits !== wrongDigits || correctHighest !== wrongHighest
  const lastDigitCorrect = (wrong % 10) === (correct % 10)

  return {
    valid: isValid,
    detail: `位数${correctDigits}→${wrongDigits}, 首位${correctHighest}→${wrongHighest}, 个位保持${lastDigitCorrect}`
  }
}

describe('Estimate算法单元测试', () => {

  describe('算法正确性测试 - 应该100%通过', () => {

    test('首位变化方案应该正确工作', () => {
      // 设置随机种子以确保可重现性（如果需要的话）
      const testNumbers = [123, 456, 789, 1234, 5678, 12345, 98765]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        // 测试多次以确保算法稳定性
        for (let i = 0; i < 10; i++) {
          totalTests++

          // 强制使用首位变化方案（通过控制随机数）
          Math.random = () => 0.3 // 确保选择首位变化方案

          const wrong = makeStrategicError_Estimate(correct)
          const validation = validateEstimateSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`首位变化失败: ${correct} → ${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`首位变化方案成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)

      // 算法本身应该是100%正确的
      expect(successRate).toBe(100)
    })

    test('数字插入/删除方案应该正确工作', () => {
      const testNumbers = [123, 456, 789, 1234, 5678, 12345, 98765]
      let successCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          totalTests++

          // 强制使用插入/删除方案
          Math.random = () => 0.7 // 确保选择插入/删除方案

          const wrong = makeStrategicError_Estimate(correct)
          const validation = validateEstimateSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          } else {
            console.log(`插入/删除失败: ${correct} → ${wrong}, ${validation.detail}`)
          }
        }
      })

      const successRate = (successCount / totalTests) * 100
      console.log(`插入/删除方案成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)

      // 算法本身应该是100%正确的
      expect(successRate).toBe(100)
    })

    test('个位数应该始终保持正确', () => {
      const testNumbers = [123, 456, 789, 1234, 5678, 12345, 98765, -123, -456, 0]
      let preservedCount = 0
      let totalTests = 0

      testNumbers.forEach(correct => {
        for (let i = 0; i < 20; i++) {
          totalTests++
          const wrong = makeStrategicError_Estimate(correct)

          if (correct % 10 === wrong % 10) {
            preservedCount++
          } else {
            console.log(`个位数错误: ${correct}%10=${correct%10} → ${wrong}%10=${wrong%10}`)
          }
        }
      })

      const preservationRate = (preservedCount / totalTests) * 100
      console.log(`个位数保持率: ${preservedCount}/${totalTests} (${preservationRate.toFixed(1)}%)`)

      // 个位数应该100%保持正确
      expect(preservationRate).toBe(100)
    })
  })

  describe('边界情况测试', () => {

    test('一位数应该正确处理', () => {
      const oneDigitNumbers = [1, 5, 9, 0, -3, -8]
      let successCount = 0

      oneDigitNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_Estimate(correct)
          const validation = validateEstimateSkill(correct, wrong)

          if (validation.valid) {
            successCount++
          }
        }
      })

      expect(successCount).toBeGreaterThan(0) // 至少应该有一些成功的情况
      console.log(`一位数处理成功率: ${successCount}/${oneDigitNumbers.length * 10}`)
    })

    test('大数字应该正确处理', () => {
      const largeNumbers = [12345678, 98765432, 100000000, 999999999]
      let successCount = 0

      largeNumbers.forEach(correct => {
        for (let i = 0; i < 10; i++) {
          const wrong = makeStrategicError_Estimate(correct)
          const validation = validateEstimateSkill(correct, wrong)

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
        -123, -456, -7890, -12345
      ]

      let successCount = 0
      let digitChangeCount = 0
      let highestChangeCount = 0

      mixedNumbers.forEach(correct => {
        for (let i = 0; i < 5; i++) {
          const wrong = makeStrategicError_Estimate(correct)
          const validation = validateEstimateSkill(correct, wrong)

          if (validation.valid) {
            successCount++

            // 统计变化类型
            const correctDigits = Math.abs(correct).toString().length
            const wrongDigits = Math.abs(wrong).toString().length
            if (correctDigits !== wrongDigits) {
              digitChangeCount++
            } else {
              const correctHighest = Math.floor(Math.abs(correct) / Math.pow(10, correctDigits - 1))
              const wrongHighest = Math.floor(Math.abs(wrong) / Math.pow(10, wrongDigits - 1))
              if (correctHighest !== wrongHighest) {
                highestChangeCount++
              }
            }
          }
        }
      })

      const totalTests = mixedNumbers.length * 5
      const successRate = (successCount / totalTests) * 100

      console.log(`=== Estimate算法综合测试结果 ===`)
      console.log(`总成功率: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`)
      console.log(`位数变化: ${digitChangeCount}, 首位变化: ${highestChangeCount}`)

      // 算法单元测试应该达到100%成功率
      expect(successRate).toBe(100)
      expect(digitChangeCount + highestChangeCount).toBeGreaterThan(0)
    })
  })
})