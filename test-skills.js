// 测试技能出错算法
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

// SpecialDigits 技能
function generateSpecialDigitsError(correct) {
  const currentSum = digitSum(correct);
  const targetMod3 = (currentSum % 3 + 1) % 3;
  const targetMod9 = (currentSum % 9 + 1) % 9;
  const modTarget = Math.random() < 0.7 ? targetMod3 : targetMod9;
  const diff = (modTarget - currentSum % 9 + 9) % 9 || 9;
  return correct + diff;
}

// CastingOutNines 技能
function generateCastingOutNinesError(correct) {
  const currentMod9 = digitSumMod9(correct);
  const wrongMod9 = (currentMod9 + 1) % 9 || 9;
  const castingError = ((wrongMod9 - currentMod9 + 9) % 9) || 9;
  return correct + castingError;
}

console.log('=== SpecialDigits 技能出错实例 ===');
const specialTestCases = [
  { expr: '123 × 3 = 369', correct: 369 },
  { expr: '45 × 9 = 405', correct: 405 },
  { expr: '78 × 6 = 468', correct: 468 }
];

specialTestCases.forEach(test => {
  const wrong = generateSpecialDigitsError(test.correct);
  console.log(`正确: ${test.expr}`);
  console.log(`错误: ${test.expr.replace(test.correct, wrong)}`);
  console.log(`正确答案数字和: ${digitSum(test.correct)} (${test.correct % 3 === 0 ? '✓' : '✗'}被3整除, ${test.correct % 9 === 0 ? '✓' : '✗'}被9整除)`);
  console.log(`错误答案数字和: ${digitSum(wrong)} (${wrong % 3 === 0 ? '✓' : '✗'}被3整除, ${wrong % 9 === 0 ? '✓' : '✗'}被9整除)`);
  console.log('---');
});

console.log('\n=== CastingOutNines (弃九验算法) 出错实例 ===');
const castingTestCases = [
  { expr: '145 + 289 = 434', correct: 434 },
  { expr: '567 + 234 = 801', correct: 801 },
  { expr: '123 + 456 = 579', correct: 579 }
];

castingTestCases.forEach(test => {
  const wrong = generateCastingOutNinesError(test.correct);
  console.log(`正确: ${test.expr}`);
  console.log(`错误: ${test.expr.replace(test.correct, wrong)}`);
  console.log(`弃九验算 - 正确右边模9: ${digitSumMod9(test.correct)} ✓`);
  console.log(`弃九验算 - 错误右边模9: ${digitSumMod9(wrong)} ✗`);
  console.log('---');
});