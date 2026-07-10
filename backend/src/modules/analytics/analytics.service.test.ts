/**
 * Assigned to: E/21/200, Rangana Madhushanka
 * Function under test: analyticsService.computeAnalytics(batches)
 * External dependency: NONE for this function — it's pure, given a batches
 *   array. (batchRepository is only touched by forFactory/forAll, which
 *   wrap this function; not needed for unit-testing the calculation logic.)
 *
 * Test design (equivalence partitioning on the shape of the batches array):
 *  - Empty array
 *  - All batches unpriced / not COMPLETED (no revenue to compute)
 *  - Mixed priced + unpriced batches
 *  - All batches priced and COMPLETED
 *  - Boundary: a single priced batch (edge of "averagePrice" division)
 */
import { analyticsService } from './analytics.service';
import { Batch } from '../../types';

function batch(overrides: Partial<Batch>): Batch {
  return {
    batchId: 'BATCH-0',
    factoryId: 'FAC-1',
    deviceId: 'DEV-1',
    status: 'COMPLETED',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('analyticsService.computeAnalytics', () => {
  // --- Equivalence class: empty input ---
  it('returns zeroed-out analytics for an empty batch list', () => {
    const result = analyticsService.computeAnalytics([]);

    expect(result.totalBatches).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averagePrice).toBe(0);
    expect(result.highestSellingBatch).toBeNull();
    expect(result.priceVariation).toEqual([]);
  });

  // --- Equivalence class: batches exist but none are priced/COMPLETED ---
  it('excludes DRAFT/ONGOING and unpriced batches from revenue figures', () => {
    const batches = [
      batch({ batchId: 'B1', status: 'DRAFT' }),
      batch({ batchId: 'B2', status: 'ONGOING' }),
      batch({ batchId: 'B3', status: 'COMPLETED', sellingPrice: undefined }),
    ];

    const result = analyticsService.computeAnalytics(batches);

    expect(result.totalBatches).toBe(3); // counted regardless of price
    expect(result.totalRevenue).toBe(0);
    expect(result.averagePrice).toBe(0);
    expect(result.highestSellingBatch).toBeNull();
  });

  // --- Boundary: exactly one priced batch (edge of division-by-count) ---
  it('computes averagePrice correctly for a single priced batch', () => {
    const batches = [
      batch({
        batchId: 'B1',
        sellingPrice: 250,
        completedAt: '2026-02-10T00:00:00.000Z',
      }),
    ];

    const result = analyticsService.computeAnalytics(batches);

    expect(result.totalRevenue).toBe(250);
    expect(result.averagePrice).toBe(250);
    expect(result.highestSellingBatch?.batchId).toBe('B1');
  });

  // --- Equivalence class: mixed priced + unpriced batches ---
  it('mixes priced and unpriced batches and only aggregates the priced ones', () => {
    const batches = [
      batch({ batchId: 'B1', sellingPrice: 100, completedAt: '2026-01-05T00:00:00.000Z' }),
      batch({ batchId: 'B2', status: 'DRAFT' }),
      batch({ batchId: 'B3', sellingPrice: 300, completedAt: '2026-01-20T00:00:00.000Z' }),
    ];

    const result = analyticsService.computeAnalytics(batches);

    expect(result.totalBatches).toBe(3);
    expect(result.totalRevenue).toBe(400);
    expect(result.averagePrice).toBe(200);
    expect(result.highestSellingBatch?.batchId).toBe('B3');
  });

  // --- Equivalence class: all batches priced and COMPLETED ---
  it('aggregates weekly/monthly profit when every batch is priced', () => {
    const batches = [
      batch({ batchId: 'B1', sellingPrice: 100, completedAt: '2026-03-02T00:00:00.000Z' }),
      batch({ batchId: 'B2', sellingPrice: 150, completedAt: '2026-03-09T00:00:00.000Z' }),
    ];

    const result = analyticsService.computeAnalytics(batches);

    expect(result.totalRevenue).toBe(250);
    expect(result.monthlyProfit).toEqual([{ month: '2026-03', profit: 250 }]);
    expect(result.weeklyProfit.length).toBe(2);
  });
});
