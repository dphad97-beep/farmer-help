import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCropListingFromText } from './cropListingParser';
import {
  normalizeToKg,
  normalizePricePerKg,
  calculateTotalOfferValue,
  compareWithBenchmark,
} from './pricingCalculator';

test('cropListingParser extracts English produce statement', () => {
  const input = 'I have 500 kilograms of onions in Nashik, ready for sale at ₹24 per kg';
  const result = extractCropListingFromText(input);

  assert.equal(result.cropName, 'Onion');
  assert.equal(result.quantity, 500);
  assert.equal(result.unit, 'kg');
  assert.match(result.location, /Nashik/i);
  assert.equal(result.expectedPrice, 24);
  assert.equal(result.priceUnit, 'kg');
});

test('cropListingParser extracts Marathi produce statement with quintal and kanda', () => {
  const input = 'माझ्याकडे लासलगाव येथे 25 क्विंटल कांदा आहे, भाव ₹2200 प्रति क्विंटल हवा आहे';
  const result = extractCropListingFromText(input);

  assert.equal(result.cropName, 'Onion');
  assert.equal(result.quantity, 25);
  assert.equal(result.unit, 'quintal');
  assert.match(result.location, /Lasalgaon/i);
});

test('cropListingParser extracts Wheat in Pune with ton units', () => {
  const input = 'Have 3 tons of Sharbati wheat in Pune ready for pickup, expected 2800 per quintal';
  const result = extractCropListingFromText(input);

  assert.equal(result.cropName, 'Wheat');
  assert.equal(result.quantity, 3);
  assert.equal(result.unit, 'ton');
  assert.match(result.location, /Pune/i);
});

test('pricingCalculator normalizes units to kilograms correctly', () => {
  assert.equal(normalizeToKg(50, 'kg'), 50);
  assert.equal(normalizeToKg(15, 'quintal'), 1500);
  assert.equal(normalizeToKg(2, 'ton'), 2000);
});

test('pricingCalculator normalizes price per quintal to per kg', () => {
  assert.equal(normalizePricePerKg(2400, 'quintal'), 24);
  assert.equal(normalizePricePerKg(25, 'kg'), 25);
});

test('pricingCalculator computes total offer valuation', () => {
  // 10 quintals (=1000kg) at ₹22/kg => ₹22,000
  const total = calculateTotalOfferValue(22, 'kg', 10, 'quintal');
  assert.equal(total, 22000);

  // 500 kg at ₹2500/quintal (=₹25/kg) => ₹12,500
  const total2 = calculateTotalOfferValue(2500, 'quintal', 500, 'kg');
  assert.equal(total2, 12500);
});

test('compareWithBenchmark flags favorable and unfavorable offers', () => {
  // Offered 26/kg vs Benchmark 24/kg (+8.3%)
  const favorable = compareWithBenchmark(26, 'kg', 24, 'kg');
  assert.equal(favorable.isFavorable, true);
  assert.match(favorable.badgeText, /Above Market/i);

  // Offered 20/kg vs Benchmark 25/kg (-20%)
  const unfavorable = compareWithBenchmark(20, 'kg', 25, 'kg');
  assert.equal(unfavorable.isFavorable, false);
  assert.match(unfavorable.badgeText, /Underpriced|Below Market/i);
});
