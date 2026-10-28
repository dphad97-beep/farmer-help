import test from 'node:test';
import assert from 'node:assert/strict';
import { handleIvrInput, PhoneCallSession } from './telephonyEngine';

function createMockSession(): PhoneCallSession {
  return {
    callId: 'call-test-123',
    callerNumber: '+91 98220 99887',
    language: 'mr',
    currentState: 'WELCOME_LANG',
    collectedData: {},
    history: [],
    createdAt: new Date().toISOString(),
    isSimulated: true,
  };
}

test('telephonyEngine switches language to Marathi on DTMF 1', () => {
  const session = createMockSession();
  const { nextSession, responsePrompt } = handleIvrInput(session, '1', 'dtmf');

  assert.equal(nextSession.language, 'mr');
  assert.equal(nextSession.currentState, 'MAIN_MENU');
  assert.match(responsePrompt, /मुख्य मेनू/);
});

test('telephonyEngine switches language to Hindi on DTMF 2', () => {
  const session = createMockSession();
  const { nextSession, responsePrompt } = handleIvrInput(session, '2', 'dtmf');

  assert.equal(nextSession.language, 'hi');
  assert.equal(nextSession.currentState, 'MAIN_MENU');
  assert.match(responsePrompt, /मुख्य मेनू: कृषि मित्र AI/);
});

test('telephonyEngine handles menu option 5 for human expert callback and generates KVK ticket', () => {
  let session = createMockSession();
  session.currentState = 'MAIN_MENU';
  session.language = 'mr';

  const { nextSession, responsePrompt } = handleIvrInput(session, '5', 'dtmf');

  assert.equal(nextSession.currentState, 'EXPERT_CALLBACK_LOGGED');
  assert.ok(nextSession.collectedData.ticketId?.startsWith('KVK-'));
  assert.match(responsePrompt, /कृषी विज्ञान केंद्र/);
});

test('telephonyEngine runs complete crop registration flow over keypad phone', () => {
  let session = createMockSession();
  session.currentState = 'MAIN_MENU';
  session.language = 'mr';

  // 1. Select option 4 (Register Crop)
  let res = handleIvrInput(session, '4', 'dtmf');
  session = res.nextSession;
  assert.equal(session.currentState, 'CROP_REG_NAME');

  // 2. Provide Name
  res = handleIvrInput(session, 'Dattatray Phadke', 'speech');
  session = res.nextSession;
  assert.equal(session.currentState, 'CROP_REG_CROP');
  assert.equal(session.collectedData.farmerName, 'Dattatray Phadke');

  // 3. Provide Crop Name
  res = handleIvrInput(session, 'कांदा', 'speech');
  session = res.nextSession;
  assert.equal(session.currentState, 'CROP_REG_QTY');
  assert.equal(session.collectedData.cropName, 'कांदा');

  // 4. Provide Quantity
  res = handleIvrInput(session, '30 क्विंटल', 'speech');
  session = res.nextSession;
  assert.equal(session.currentState, 'CROP_REG_PRICE');
  assert.equal(session.collectedData.quantity, 30);
  assert.equal(session.collectedData.unit, 'quintal');

  // 5. Provide Price
  res = handleIvrInput(session, '2300 प्रति क्विंटल', 'speech');
  session = res.nextSession;
  assert.equal(session.currentState, 'CROP_REG_LOCATION');
  assert.equal(session.collectedData.expectedPrice, 2300);

  // 6. Provide Location
  res = handleIvrInput(session, 'लासलगाव, नाशिक', 'speech');
  session = res.nextSession;
  assert.equal(session.currentState, 'CROP_REG_CONFIRM');
  assert.match(res.responsePrompt, /नोंदणी निश्चित करण्यासाठी १ दाबा/);

  // 7. Confirm with DTMF 1
  res = handleIvrInput(session, '1', 'dtmf');
  session = res.nextSession;
  assert.equal(session.currentState, 'CALL_ENDED');
  assert.equal(res.hangup, true);
  assert.match(res.responsePrompt, /अभिनंदन/);
});

test('telephonyEngine handles star (*) to repeat menu', () => {
  let session = createMockSession();
  session.currentState = 'MAIN_MENU';
  session.language = 'en';

  const { nextSession, responsePrompt } = handleIvrInput(session, '*', 'dtmf');
  assert.match(responsePrompt, /Main Menu/);
});
