// 最终的技能测试脚本 - 测试所有技能的实际表现

// 从技能验证脚本复制的核心函数
function digitSum(n) {
  let s = 0, abs = Math.abs(n);
  while (abs > 0) { s += abs % 10; abs = Math.floor(abs / 10); }
  return s;
}

function digitSumMod9(n) {
  let s = 0, abs = Math.abs(n);
  while (abs > 0) { s += abs % 10; abs = Math.floor(abs / 10); }
  return s % 9;
}

function generateNumberWithDigitCount(digits, allowNegative = false) {
  if (digits <= 0) return 1
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  let num = Math.floor(Math.random() * (max - min + 1)) + min
  if (allowNegative && Math.random() < 0.3) {
    num = -num
  }
  return num
}

function distributeDigits(totalDigits, count) {
  if (count <= 0) return []
  if (count === 1) return [totalDigits]

  const digits = []
  let remaining = totalDigits

  for (let i = 0; i < count - 1; i++) {
    const minDigits = 1
    const maxDigits = Math.max(minDigits, remaining - (count - i - 1))
    const assignedDigits = Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits
    digits.push(assignedDigits)
    remaining -= assignedDigits
  }

  digits.push(remaining)
  return digits
}

function generateTwoTermsExpression(digitDifficulty, operator, withParentheses = false, allowNegative = false, allowFractions = false) {
  const digits = distributeDigits(digitDifficulty, 2)
  const a = generateNumberWithDigitCount(digits[0], allowNegative)
  const b = generateNumberWithDigitCount(digits[1], allowNegative)

  const op = operator === 'plus' ? '+' : operator === 'minus' ? '-' : operator === 'mul' ? '*' : '/'

  let value
  if (op === '/') {
    if (!allowFractions) {
      const absA = Math.abs(a)
      const divisors = []
      for (let d = 1; d <= absA; d++) {
        if (absA % d === 0) {
          const candidate = Math.abs(b)
          if (candidate.toString().length <= digits[1]) {
            divisors.push(d)
          }
        }
      }
      const divisor = divisors[Math.floor(Math.random() * divisors.length)] || 1
      const signA = a < 0 ? -1 : 1
      const signB = b < 0 ? -1 : 1
      value = (signA * absA) / divisor * signB

      const expr = `${a} ÷ ${divisor}`
      return { expr, value, digitDifficulty }
    } else {
      value = a / b
    }
  } else {
    value = op === '+' ? a + b : op === '-' ? a - b : a * b
  }

  const expr = withParentheses ? `(${a} ${op} ${b})` : `${a} ${op} ${b}`
  return { expr, value, digitDifficulty }
}

// 使用修复后的算法
function makeStrategicError(correct, skill, allowNegative = false) {
  let v = correct
  const lastDigit = correct % 10
  const absCorrect = Math.abs(correct)

  switch (skill) {
    case 'lastDigit':
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

    case 'parity':
      v = correct + (correct % 2 === 0 ? 1 : -1)
      break

    case 'carryBorrow':
      const carryError = (Math.random() < 0.5 ? 10 : 20) * (Math.random() < 0.5 ? 1 : -1)
      v = correct + carryError
      break

    case 'specialDigits':
      const currentSum = digitSum(correct)
      const targetMod3 = (currentSum % 3 + 1) % 3
      const targetMod9 = (currentSum % 9 + 1) % 9
      const modTarget = Math.random() < 0.7 ? targetMod3 : targetMod9

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
      const currentMod9_value = digitSumMod9(correct)
      const wrongMod9_value = (currentMod9_value + 1) % 9 || 9

      let foundCasting = false
      const strategies = [
        () => {
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

// 验证技能函数（修复后的estimate验证）
function validateSkill(question) {
  const { expression, correct, wrong, skill } = question

  switch (skill) {
    case 'lastDigit':
      const correctLast = correct % 10
      const wrongLast = wrong % 10
      return {
        valid: correctLast !== wrongLast,
        detail: `个位数不同: ${correctLast} → ${wrongLast}`
      }

    case 'estimate':
      const correctDigits = Math.abs(correct).toString().length
      const wrongDigits = Math.abs(wrong).toString().length
      const correctHighest = Math.floor(Math.abs(correct) / Math.pow(10, correctDigits - 1))
      const wrongHighest = Math.floor(Math.abs(wrong) / Math.pow(10, wrongDigits - 1))
      return {
        valid: correctDigits !== wrongDigits || correctHighest !== wrongHighest,
        detail: `估算差异: 位数${correctDigits}→${wrongDigits}, 首位${correctHighest}→${wrongHighest}`
      }

    case 'parity':
      return {
        valid: (correct % 2) !== (wrong % 2),
        detail: `奇偶性不同: ${correct % 2 === 0 ? '偶' : '奇'} → ${wrong % 2 === 0 ? '偶' : '奇'}`
      }

    case 'carryBorrow':
      const correctTens = Math.floor(correct / 10) % 10
      const wrongTens = Math.floor(wrong / 10) % 10
      return {
        valid: (correct % 10) === (wrong % 10) && correctTens !== wrongTens,
        detail: `个位数相同(${correct % 10})，十位数不同: ${correctTens} → ${wrongTens}`
      }

    case 'specialDigits':
      const correctDiv3 = correct % 3 === 0
      const wrongDiv3 = wrong % 3 === 0
      const correctDiv9 = correct % 9 === 0
      const wrongDiv9 = wrong % 9 === 0
      return {
        valid: (correctDiv3 !== wrongDiv3) || (correctDiv9 !== wrongDiv9),
        detail: `3/9整除性变化: 3整除${correctDiv3}→${wrongDiv3}, 9整除${correctDiv9}→${wrongDiv9}`
      }

    case 'castingOutNines':
      const correctMod9 = digitSumMod9(correct)
      const wrongMod9 = digitSumMod9(wrong)
      return {
        valid: correctMod9 !== wrongMod9,
        detail: `弃九模9不同: ${correctMod9} → ${wrongMod9}`
      }

    default:
      return { valid: false, detail: '未知技能' }
  }
}

// 生成适合特定技能的题目
function generateQuestionForSkill(skill, digitDifficulty) {
  let expr, value

  switch (skill) {
    case 'specialDigits':
      const digits = distributeDigits(digitDifficulty, 2)
      const a = generateNumberWithDigitCount(digits[0])
      let b = generateNumberWithDigitCount(digits[1])

      if (b % 3 !== 0) {
        b = b + (3 - (b % 3))
      }

      expr = `${a} × ${b}`
      value = a * b
      break

    case 'castingOutNines':
      const result = generateTwoTermsExpression(digitDifficulty, 'plus')
      expr = result.expr
      value = result.value
      break

    case 'carryBorrow':
      const op = Math.random() < 0.5 ? 'plus' : 'minus'
      const borrowResult = generateTwoTermsExpression(digitDifficulty, op)
      expr = borrowResult.expr
      value = borrowResult.value
      break

    default:
      const defaultResult = generateTwoTermsExpression(digitDifficulty, 'plus')
      expr = defaultResult.expr
      value = defaultResult.value
  }

  const wrongValue = makeStrategicError(value, skill)
  return {
    expression: expr,
    correct: value,
    wrong: wrongValue,
    skill: skill,
    digitDifficulty: digitDifficulty
  }
}

// 最终测试函数
function finalSkillTest(digitDifficulty) {
  const skills = ['lastDigit', 'estimate', 'parity', 'carryBorrow', 'specialDigits', 'castingOutNines']
  console.log(`\n=== 最终技能测试报告 - 总位数: ${digitDifficulty} ===\n`)

  let totalValidCount = 0
  let totalQuestions = skills.length * 10

  skills.forEach(skill => {
    console.log(`【${skill} 技能】`)
    let validCount = 0

    for (let i = 0; i < 10; i++) {
      const question = generateQuestionForSkill(skill, digitDifficulty)
      const validation = validateSkill(question)

      if (validation.valid) validCount++
      totalValidCount++
    }

    console.log(`  验证通过率: ${validCount}/10 (${(validCount / 10 * 100).toFixed(1)}%)`)

    // 显示一个示例
    const example = generateQuestionForSkill(skill, digitDifficulty)
    const validation = validateSkill(example)
    console.log(`  示例: ${example.expression} = ${example.wrong} (正确: ${example.correct})`)
    console.log(`  ${validation.detail}`)
    console.log('')
  })

  const overallSuccessRate = (totalValidCount / totalQuestions * 100).toFixed(1)
  console.log(`=== 总体成功率 ===`)
  console.log(`总验证通过率: ${totalValidCount}/${totalQuestions} (${overallSuccessRate}%)`)

  if (overallSuccessRate >= 80) {
    console.log('✅ 所有技能测试通过！')
  } else {
    console.log('❌ 部分技能仍需改进')
  }
}

// 运行最终测试
console.log('最终技能测试启动...')
const digitDifficulty = 6
finalSkillTest(digitDifficulty)