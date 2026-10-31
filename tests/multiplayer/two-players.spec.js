const {test,expect}=require('@playwright/test');
const bank=require('../../public/questions');

test('two independent desktop/mobile players stay synchronized through a full game',async({browser,baseURL})=>{
  const hostContext=await browser.newContext({viewport:{width:1280,height:900}});
  const guestContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const host=await hostContext.newPage(), guest=await guestContext.newPage();
  const errors=[];for(const page of [host,guest])page.on('pageerror',e=>errors.push(e.message));
  try {
    await Promise.all([host.goto(baseURL),guest.goto(baseURL)]);
    await Promise.all([host.waitForFunction(()=>ws.readyState===1),guest.waitForFunction(()=>ws.readyState===1)]);
    await host.locator('#in-name').fill('Desktop Host');await host.locator('#btn-create').click();
    await expect(host.locator('#scr-lobby')).toBeVisible();
    const code=await host.locator('#room-code').textContent();expect(code).toMatch(/^[A-Z]{4}$/);
    await guest.locator('#in-name').fill('Mobile Guest');await guest.locator('#in-code').fill(code);await guest.locator('#btn-join').click();
    await expect(guest.locator('#scr-lobby')).toBeVisible();await expect(guest.locator('#room-code')).toHaveText(code);
    await expect(host.locator('#lobby-players li')).toHaveCount(2);await expect(guest.locator('#lobby-players li')).toHaveCount(2);
    await expect(host.locator('#btn-start')).toBeEnabled();await host.locator('#btn-start').click();
    const seen=new Set();let lastScore=0;
    for(let n=1;n<=10;n++) {
      await expect(host.locator('#scr-game')).toBeVisible();await expect(guest.locator('#scr-game')).toBeVisible();
      await expect(host.locator('#q-num')).toHaveText(`Question ${n} of 10`);await expect(guest.locator('#q-num')).toHaveText(`Question ${n} of 10`);
      const question=await host.locator('#q-text').textContent();await expect(guest.locator('#q-text')).toHaveText(question);expect(seen.has(question)).toBe(false);seen.add(question);
      const hostAnswers=await host.locator('#q-answers .ans').allTextContents();expect(await guest.locator('#q-answers .ans').allTextContents()).toEqual(hostAnswers);
      const hostTime=parseInt(await host.locator('#q-timer').textContent()),guestTime=parseInt(await guest.locator('#q-timer').textContent());expect(Math.abs(hostTime-guestTime)).toBeLessThanOrEqual(1);
      const q=bank.find(q=>q.text===question);expect(q).toBeTruthy();const correct=hostAnswers.indexOf(q.answers[q.correct]);
      await host.locator('#q-answers .ans').nth(correct).click();await expect(host.locator('#q-locked')).toBeVisible();
      await guest.locator('#q-answers .ans').nth((correct+1)%4).tap();
      await expect(host.locator('#scr-reveal')).toBeVisible();await expect(guest.locator('#scr-reveal')).toBeVisible();
      await expect(host.locator('#rev-title')).toHaveText('Correct!');await expect(guest.locator('#rev-title')).toHaveText('Wrong!');
      const hostScores=await host.locator('#rev-board .pts').allTextContents(),guestScores=await guest.locator('#rev-board .pts').allTextContents();expect(guestScores).toEqual(hostScores);expect(hostScores.length).toBe(2);expect(Number(hostScores[0])).toBeGreaterThan(lastScore);expect(Number(hostScores[1])).toBe(0);lastScore=Number(hostScores[0]);
      if(n===1)console.log(`PASS shared room ${code}: desktop/mobile answered same question; both leaderboards updated to ${hostScores.join('/')}.`);
    }
    await expect(host.locator('#scr-end')).toBeVisible();await expect(guest.locator('#scr-end')).toBeVisible();
    await expect(host.locator('#winner')).toHaveText('YOU WIN!');await expect(guest.locator('#winner')).toHaveText('Desktop Host wins!');
    expect(await guest.locator('#final-board .pts').allTextContents()).toEqual(await host.locator('#final-board .pts').allTextContents());
    expect(errors).toEqual([]);console.log('PASS: all 10 questions synchronized, final standings match, no browser exceptions.');
  } finally {await hostContext.close();await guestContext.close();}
});
