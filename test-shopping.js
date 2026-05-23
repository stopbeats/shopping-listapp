const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, 'shopping-list.html');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(FILE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  console.log('\n=== 쇼핑 리스트 앱 자동 테스트 ===\n');

  console.log('[1] 초기 상태 확인');
  const emptyMsg = await page.locator('#emptyMsg').isVisible();
  assert(emptyMsg, '빈 목록 메시지가 표시된다');

  const listItems = await page.locator('#list li').count();
  assert(listItems === 0, '아이템이 0개다');

  console.log('\n[2] 아이템 추가');

  await page.fill('#itemInput', '우유');
  await page.click('button:has-text("추가")');
  assert(await page.locator('#list li').count() === 1, '버튼 클릭으로 아이템 추가된다');
  assert(await page.inputValue('#itemInput') === '', '추가 후 입력창이 초기화된다');

  await page.fill('#itemInput', '계란');
  await page.press('#itemInput', 'Enter');
  assert(await page.locator('#list li').count() === 2, 'Enter 키로 아이템 추가된다');

  await page.fill('#itemInput', '빵');
  await page.press('#itemInput', 'Enter');
  assert(await page.locator('#list li').count() === 3, '세 번째 아이템 추가된다');

  await page.fill('#itemInput', '   ');
  await page.click('button:has-text("추가")');
  assert(await page.locator('#list li').count() === 3, '공백만 입력 시 추가되지 않는다');

  assert(!(await page.locator('#emptyMsg').isVisible()), '아이템 추가 후 빈 메시지가 사라진다');

  const itemTexts = await page.locator('.item-name').allTextContents();
  assert(itemTexts[0] === '우유', '첫 번째 아이템 이름이 "우유"다');
  assert(itemTexts[1] === '계란', '두 번째 아이템 이름이 "계란"다');
  assert(itemTexts[2] === '빵', '세 번째 아이템 이름이 "빵"이다');

  console.log('\n[3] 체크(완료 표시) 기능');

  const firstCheckbox = page.locator('#list li').first().locator('input[type="checkbox"]');
  await firstCheckbox.check();

  const firstLiDone = await page.locator('#list li').first().getAttribute('class');
  assert(firstLiDone?.includes('done'), '체크 후 li에 done 클래스가 붙는다');

  const statsText = await page.locator('#stats').textContent();
  assert(statsText?.includes('1개 완료'), '통계에 완료 1개가 표시된다');

  assert(await page.locator('#clearDoneBtn').isVisible(), '완료 항목이 생기면 일괄 삭제 버튼이 보인다');

  await firstCheckbox.uncheck();
  const firstLiAfterUncheck = await page.locator('#list li').first().getAttribute('class');
  assert(!firstLiAfterUncheck?.includes('done'), '체크 해제 후 done 클래스가 제거된다');

  console.log('\n[4] 아이템 삭제');

  await page.locator('#list li').nth(1).locator('.delete-btn').click();
  assert(await page.locator('#list li').count() === 2, '삭제 후 아이템이 2개가 된다');

  const remainingTexts = await page.locator('.item-name').allTextContents();
  assert(!remainingTexts.includes('계란'), '"계란"이 목록에서 제거된다');
  assert(remainingTexts.includes('우유'), '"우유"는 남아있다');
  assert(remainingTexts.includes('빵'), '"빵"은 남아있다');

  console.log('\n[5] 완료 항목 일괄 삭제');

  await page.locator('#list li').nth(0).locator('input[type="checkbox"]').check();
  await page.locator('#list li').nth(1).locator('input[type="checkbox"]').check();

  assert(await page.locator('#clearDoneBtn').isVisible(), '완료 항목 일괄 삭제 버튼이 보인다');

  await page.click('#clearDoneBtn');
  assert(await page.locator('#list li').count() === 0, '완료 항목 일괄 삭제 후 목록이 비워진다');
  assert(await page.locator('#emptyMsg').isVisible(), '목록 비워진 후 빈 메시지가 다시 표시된다');

  console.log('\n[6] localStorage 영속성');

  await page.fill('#itemInput', '오렌지');
  await page.press('#itemInput', 'Enter');
  await page.fill('#itemInput', '사과');
  await page.press('#itemInput', 'Enter');

  await page.reload();
  assert(await page.locator('#list li').count() === 2, '새로고침 후에도 아이템이 유지된다');

  const savedTexts = await page.locator('.item-name').allTextContents();
  assert(savedTexts.includes('오렌지'), '"오렌지"가 새로고침 후 유지된다');
  assert(savedTexts.includes('사과'), '"사과"가 새로고침 후 유지된다');

  console.log(`\n${'─'.repeat(36)}`);
  console.log(`결과: ${passed + failed}개 테스트 중 ${passed}개 통과, ${failed}개 실패`);
  if (failed === 0) {
    console.log('모든 테스트 통과!');
  } else {
    console.log('일부 테스트 실패. 위 내용을 확인하세요.');
  }
  console.log('─'.repeat(36));

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();