// 技能验证脚本 - 针对每种targetSkills在指定位数下生成10道错题

// 从QuestionGenerator复制的函数
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

function lastDigit(n) { return Math.abs(n) % 10 }

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

function makeStrategicError(correct, skill, allowNegative = false) {
  let v = correct
  const lastDigit = correct % 10
  const absCorrect = Math.abs(correct)

  switch (skill) {
    case 'lastDigit':
      // 在±5范围内（排除0）
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
      // 破坏3或9的整除性，但不修改个位数，支持更大的数值变化
      const currentSum = digitSum(correct)
      const targetMod3 = (currentSum % 3 + 1) % 3
      const targetMod9 = (currentSum % 9 + 1) % 9
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
          // 策略1：修改十位数
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

// 生成适合特定技能的题目
function generateQuestionForSkill(skill, digitDifficulty) {
  let expr, value

  switch (skill) {
    case 'specialDigits':
      // 生成包含3或9倍数的乘法
      const digits = distributeDigits(digitDifficulty, 2)
      const a = generateNumberWithDigitCount(digits[0])
      let b = generateNumberWithDigitCount(digits[1])

      // 确保b是3或9的倍数
      if (b % 3 !== 0) {
        b = b + (3 - (b % 3))
      }

      expr = `${a} × ${b}`
      value = a * b
      break

    case 'castingOutNines':
      // 生成加法题目
      const result = generateTwoTermsExpression(digitDifficulty, 'plus')
      expr = result.expr
      value = result.value
      break

    case 'carryBorrow':
      // 生成加减法题目来考察进位/借位
      const op = Math.random() < 0.5 ? 'plus' : 'minus'
      const borrowResult = generateTwoTermsExpression(digitDifficulty, op)
      expr = borrowResult.expr
      value = borrowResult.value
      break

    default:
      // 默认生成加法题目
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

// 验证技能有效性
function validateSkill(question) {
  const { expression, correct, wrong, skill } = question

  switch (skill) {
    case 'lastDigit':
      const correctLast = correct % 10
      const wrongLast = wrong % 10
      return {
        valid: correctLast !== wrongLast,
        detail: `个位数不同: ${correctLast} → ${wrongLast}`,
        correctLast,
        wrongLast
      }

    case 'estimate':
      const correctDigits = Math.abs(correct).toString().length
      const wrongDigits = Math.abs(wrong).toString().length
      const correctHighest = Math.floor(Math.abs(correct) / Math.pow(10, correctDigits - 1))
      const wrongHighest = Math.floor(Math.abs(wrong) / Math.pow(10, wrongDigits - 1))
      return {
        valid: correctDigits !== wrongDigits || correctHighest !== wrongHighest,
        detail: `估算差异: 位数${correctDigits}→${wrongDigits}, 首位${correctHighest}→${wrongHighest}`,
        correctDigits,
        wrongDigits,
        correctHighest,
        wrongHighest
      }

    case 'parity':
      return {
        valid: (correct % 2) !== (wrong % 2),
        detail: `奇偶性不同: ${correct % 2 === 0 ? '偶' : '奇'} → ${wrong % 2 === 0 ? '偶' : '奇'}`,
        correctParity: correct % 2 === 0 ? 'even' : 'odd',
        wrongParity: wrong % 2 === 0 ? 'even' : 'odd'
      }

    case 'carryBorrow':
      const correctTens = Math.floor(correct / 10) % 10
      const wrongTens = Math.floor(wrong / 10) % 10
      return {
        valid: (correct % 10) === (wrong % 10) && correctTens !== wrongTens,
        detail: `个位数相同(${correct % 10})，十位数不同: ${correctTens} → ${wrongTens}`,
        correctLast: correct % 10,
        wrongLast: wrong % 10,
        correctTens,
        wrongTens
      }

    case 'specialDigits':
      const correctSum = digitSum(correct)
      const wrongSum = digitSum(wrong)
      const correctDiv3 = correct % 3 === 0
      const wrongDiv3 = wrong % 3 === 0
      const correctDiv9 = correct % 9 === 0
      const wrongDiv9 = wrong % 9 === 0
      return {
        valid: (correctDiv3 !== wrongDiv3) || (correctDiv9 !== wrongDiv9),
        detail: `3/9整除性变化: 3整除${correctDiv3}→${wrongDiv3}, 9整除${correctDiv9}→${wrongDiv9}`,
        correctSum,
        wrongSum,
        correctDiv3,
        wrongDiv3,
        correctDiv9,
        wrongDiv9
      }

    case 'castingOutNines':
      const correctMod9 = digitSumMod9(correct)
      const wrongMod9 = digitSumMod9(wrong)
      return {
        valid: correctMod9 !== wrongMod9,
        detail: `弃九模9不同: ${correctMod9} → ${wrongMod9}`,
        correctMod9,
        wrongMod9
      }

    default:
      return { valid: false, detail: '未知技能' }
  }
}

// 主函数
function generateSkillValidation(digitDifficulty) {
  const skills = ['lastDigit', 'estimate', 'parity', 'carryBorrow', 'specialDigits', 'castingOutNines']
  const results = {}

  console.log(`\n=== 技能验证报告 - 总位数: ${digitDifficulty} ===\n`)

  skills.forEach(skill => {
    console.log(`【${skill} 技能】`)
    const questions = []
    let validCount = 0

    for (let i = 0; i < 10; i++) {
      const question = generateQuestionForSkill(skill, digitDifficulty)
      const validation = validateSkill(question)

      questions.push({
        ...question,
        validation,
        isValid: validation.valid
      })

      if (validation.valid) validCount++
    }

    results[skill] = {
      totalQuestions: 10,
      validQuestions: validCount,
      validRate: (validCount / 10 * 100).toFixed(1) + '%',
      questions: questions
    }

    console.log(`  验证通过率: ${validCount}/10 (${(validCount / 10 * 100).toFixed(1)}%)`)
    console.log('  错题示例:')

    questions.forEach((q, idx) => {
      console.log(`    ${idx + 1}. ${q.expression} = ${q.wrong} (正确: ${q.correct})`)
      console.log(`       技能: ${q.validation.detail}`)
    })
    console.log('')
  })

  return results
}

// 运行验证
console.log('技能验证脚本启动...')
console.log('用法: node skill-validator.js [总位数]')
console.log('示例: node skill-validator.js 6')

// 从命令行参数获取总位数
const args = process.argv.slice(2)
const digitDifficulty = args[0] ? parseInt(args[0]) : 6

if (isNaN(digitDifficulty) || digitDifficulty < 2 || digitDifficulty > 12) {
  console.log('错误: 请提供有效的总位数 (2-12)')
  process.exit(1)
}

generateSkillValidation(digitDifficulty)