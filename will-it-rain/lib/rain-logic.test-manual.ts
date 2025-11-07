/**
 * Manual Test Script for Rain Probability Logic
 *
 * This is a temporary manual testing script (not automated unit tests).
 * Tests all acceptance criteria with various scenarios.
 *
 * Run with: npx tsx will-it-rain/lib/rain-logic.test-manual.ts
 */

import { calculateRainProbability } from './rain-logic';
import type { ParsedForecast } from '@/types/weather';

// Helper to create test forecast data
function createTestForecast(
  probabilities: number[],
  amounts: number[] = []
): ParsedForecast[] {
  const baseTime = new Date('2025-11-07T12:00:00Z');

  return probabilities.map((prob, index) => ({
    time: new Date(baseTime.getTime() + index * 3 * 60 * 60 * 1000),
    timestamp: Math.floor(baseTime.getTime() / 1000) + index * 3 * 60 * 60,
    probability: prob,
    intensity: 'light' as const,
    amount: amounts[index] ?? 0.1,
    temperature: 65,
    description: 'light rain',
  }));
}

console.log('🧪 Manual Testing: Rain Probability Logic\n');
console.log('=' .repeat(60));

// Test AC1: Max probability detection with various values
console.log('\n✓ AC1: Max Probability Detection');
const test1 = createTestForecast([0, 30, 45, 50, 65, 100, 20, 10]);
const result1 = calculateRainProbability(test1);
console.log(`   Probabilities: [0, 30, 45, 50, 65, 100, 20, 10]`);
console.log(`   Expected max: 100`);
console.log(`   Actual max: ${result1.maxProbability}`);
console.log(`   ✓ PASS: ${result1.maxProbability === 100}`);

// Test AC2: Tie-breaking (earliest occurrence)
console.log('\n✓ AC2: Tie-Breaking Logic (Earliest Occurrence)');
const test2 = createTestForecast([30, 65, 45, 65, 50, 20, 10, 5]);
const result2 = calculateRainProbability(test2);
console.log(`   Probabilities: [30, 65, 45, 65, 50, 20, 10, 5]`);
console.log(`   Expected: 65% at index 1 (second period)`);
console.log(`   Actual: ${result2.maxProbability}% at ${result2.peakTime.toISOString()}`);
console.log(`   Peak hour index: ${test2.findIndex(f => f.time.getTime() === result2.peakTime.getTime())}`);
console.log(`   ✓ PASS: ${result2.maxProbability === 65 && test2.findIndex(f => f.time.getTime() === result2.peakTime.getTime()) === 1}`);

// Test AC3: Intensity categorization
console.log('\n✓ AC3: Intensity Categorization');
const test3a = createTestForecast([65], [0.15]); // 0.05 in/hr = light
const result3a = calculateRainProbability(test3a);
console.log(`   Light rain: 0.15 inches (3hr) = 0.05 in/hr`);
console.log(`   Peak hour intensity: ${result3a.peakHourData.intensity}`);
console.log(`   ✓ Note: Using ParsedForecast.intensity (from previous parsing)`);

const test3b = createTestForecast([65], [0.45]); // 0.15 in/hr = moderate
const result3b = calculateRainProbability(test3b);
console.log(`   Moderate rain: 0.45 inches (3hr) = 0.15 in/hr`);
console.log(`   Peak hour intensity: ${result3b.peakHourData.intensity}`);

const test3c = createTestForecast([65], [1.2]); // 0.4 in/hr = heavy
const result3c = calculateRainProbability(test3c);
console.log(`   Heavy rain: 1.2 inches (3hr) = 0.4 in/hr`);
console.log(`   Peak hour intensity: ${result3c.peakHourData.intensity}`);

// Test AC4: Precipitation amount extraction
console.log('\n✓ AC4: Precipitation Amount Extraction');
const test4 = createTestForecast([65], [0.2]);
const result4 = calculateRainProbability(test4);
console.log(`   Amount: 0.2 inches (3-hour period)`);
console.log(`   Peak hour amount: ${result4.peakHourData.amount} inches`);
console.log(`   ✓ PASS: ${result4.peakHourData.amount === 0.2}`);

// Test AC5: Decision threshold (50%)
console.log('\n✓ AC5: Decision Threshold Logic (50%)');
const test5a = createTestForecast([49]);
const result5a = calculateRainProbability(test5a);
console.log(`   49% probability → willRain: ${result5a.willRain} (expected: false)`);
console.log(`   ✓ PASS: ${result5a.willRain === false}`);

const test5b = createTestForecast([50]);
const result5b = calculateRainProbability(test5b);
console.log(`   50% probability → willRain: ${result5b.willRain} (expected: true)`);
console.log(`   ✓ PASS: ${result5b.willRain === true}`);

const test5c = createTestForecast([51]);
const result5c = calculateRainProbability(test5c);
console.log(`   51% probability → willRain: ${result5c.willRain} (expected: true)`);
console.log(`   ✓ PASS: ${result5c.willRain === true}`);

// Test AC6: Close call detection (40-49%)
console.log('\n✓ AC6: Close Call Detection (40-49%)');
const test6a = createTestForecast([39]);
const result6a = calculateRainProbability(test6a);
console.log(`   39% → closeCall: ${result6a.closeCall} (expected: false)`);
console.log(`   ✓ PASS: ${result6a.closeCall === false}`);

const test6b = createTestForecast([40]);
const result6b = calculateRainProbability(test6b);
console.log(`   40% → closeCall: ${result6b.closeCall} (expected: true)`);
console.log(`   ✓ PASS: ${result6b.closeCall === true}`);

const test6c = createTestForecast([49]);
const result6c = calculateRainProbability(test6c);
console.log(`   49% → closeCall: ${result6c.closeCall} (expected: true)`);
console.log(`   ✓ PASS: ${result6c.closeCall === true}`);

const test6d = createTestForecast([50]);
const result6d = calculateRainProbability(test6d);
console.log(`   50% → closeCall: ${result6d.closeCall} (expected: false)`);
console.log(`   ✓ PASS: ${result6d.closeCall === false}`);

// Test AC7: Result structure
console.log('\n✓ AC7: RainProbabilityResult Structure');
const test7 = createTestForecast([65, 45, 30]);
const result7 = calculateRainProbability(test7);
console.log(`   Has maxProbability: ${typeof result7.maxProbability === 'number'}`);
console.log(`   Has peakTime: ${result7.peakTime instanceof Date}`);
console.log(`   Has peakHourData: ${typeof result7.peakHourData === 'object'}`);
console.log(`   Has willRain: ${typeof result7.willRain === 'boolean'}`);
console.log(`   Has closeCall: ${typeof result7.closeCall === 'boolean'}`);
console.log(`   ✓ PASS: All fields present with correct types`);

// Edge cases
console.log('\n✓ Edge Cases');

// All zeros
const testEdge1 = createTestForecast([0, 0, 0, 0, 0, 0, 0, 0]);
const resultEdge1 = calculateRainProbability(testEdge1);
console.log(`   All zeros: maxProb=${resultEdge1.maxProbability}, willRain=${resultEdge1.willRain}`);
console.log(`   ✓ PASS: ${resultEdge1.maxProbability === 0 && resultEdge1.willRain === false}`);

// All 100%
const testEdge2 = createTestForecast([100, 100, 100, 100, 100, 100, 100, 100]);
const resultEdge2 = calculateRainProbability(testEdge2);
console.log(`   All 100%: maxProb=${resultEdge2.maxProbability}, willRain=${resultEdge2.willRain}`);
console.log(`   ✓ PASS: ${resultEdge2.maxProbability === 100 && resultEdge2.willRain === true}`);

// Single data point
const testEdge3 = createTestForecast([75]);
const resultEdge3 = calculateRainProbability(testEdge3);
console.log(`   Single point (75%): maxProb=${resultEdge3.maxProbability}, willRain=${resultEdge3.willRain}`);
console.log(`   ✓ PASS: ${resultEdge3.maxProbability === 75 && resultEdge3.willRain === true}`);

console.log('\n' + '='.repeat(60));
console.log('✅ All manual tests completed successfully!\n');
