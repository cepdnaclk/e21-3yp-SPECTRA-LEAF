/**
 * Assigned to: E/21/049, Lahiru Dinushan
 * Function under test: batchService.setSellingPrice(batchId, price)
 * External dependency mocked: batchRepository (DynamoDB-backed)
 *
 * Test design:
 *  - Equivalence classes for `price`: valid positive, invalid zero, invalid negative
 *  - Boundary value analysis around the "> 0" edge: -1, 0, 0.01, 1
 *  - Negative/error case: batch not found, batch not COMPLETED, wrong type input
 */
import { batchService } from './batch.service';
import { batchRepository } from './batch.repository';
import { Batch } from '../../types';

jest.mock('./batch.repository');

const mockedRepo = batchRepository as jest.Mocked<typeof batchRepository>;

function completedBatch(overrides: Partial<Batch> = {}): Batch {
  return {
    batchId: 'BATCH-TEST02',
    factoryId: 'FAC-1',
    deviceId: 'DEV-1',
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('batchService.setSellingPrice', () => {
  // --- Equivalence partitioning: valid class ---
  it('accepts a representative valid price (500)', async () => {
    mockedRepo.getById.mockResolvedValue(completedBatch());
    mockedRepo.updatePrice.mockResolvedValue(
      completedBatch({ sellingPrice: 500 })
    );

    const result = await batchService.setSellingPrice('BATCH-TEST02', 500);
    expect(result.sellingPrice).toBe(500);
  });

  // --- Boundary value analysis: smallest valid positive value ---
  it('accepts the smallest positive value just above the boundary (0.01)', async () => {
    mockedRepo.getById.mockResolvedValue(completedBatch());
    mockedRepo.updatePrice.mockResolvedValue(
      completedBatch({ sellingPrice: 0.01 })
    );

    const result = await batchService.setSellingPrice('BATCH-TEST02', 0.01);
    expect(result.sellingPrice).toBe(0.01);
  });

  // --- Boundary value analysis: exactly on the boundary (0) ---
  it('rejects exactly 0 (on the boundary, not valid)', async () => {
    await expect(
      batchService.setSellingPrice('BATCH-TEST02', 0)
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockedRepo.getById).not.toHaveBeenCalled();
  });

  // --- Boundary value analysis: just below the boundary (-1) ---
  it('rejects a negative price (-1)', async () => {
    await expect(
      batchService.setSellingPrice('BATCH-TEST02', -1)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  // --- Error case: batch does not exist ---
  it('throws 404 when the batch does not exist', async () => {
    mockedRepo.getById.mockResolvedValue(null);

    await expect(
      batchService.setSellingPrice('BATCH-MISSING', 500)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  // --- Error case: batch is not COMPLETED yet ---
  it('throws 409 when the batch status is not COMPLETED', async () => {
    mockedRepo.getById.mockResolvedValue(completedBatch({ status: 'ONGOING' }));

    await expect(
      batchService.setSellingPrice('BATCH-TEST02', 500)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  // --- KNOWN GAP surfaced by testing, not a passing spec ---
  // `price <= 0` is false for NaN (e.g. from a bad parseFloat upstream),
  // so validation is skipped and NaN would be persisted as the selling price.
  // This test documents the current (buggy) behavior for the Step 3 peer
  // review — the fix is to add an explicit `Number.isFinite(price)` check.
  it('DOCUMENTS A GAP: NaN bypasses the price validation entirely', async () => {
    mockedRepo.getById.mockResolvedValue(completedBatch());
    mockedRepo.updatePrice.mockResolvedValue(
      completedBatch({ sellingPrice: NaN })
    );

    const result = await batchService.setSellingPrice('BATCH-TEST02', NaN);

    // This "passes" today, which is exactly the problem: no AppError is
    // thrown and NaN reaches the repository layer.
    expect(mockedRepo.updatePrice).toHaveBeenCalledWith('BATCH-TEST02', NaN);
    expect(Number.isNaN(result.sellingPrice)).toBe(true);
  });
});
