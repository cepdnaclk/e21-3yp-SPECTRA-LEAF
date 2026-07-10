/**
 * Assigned to: E/21/226, Nadeera Kothalawala
 * Function under test: batchService.setGoodLeafPercentage(batchId, pct)
 * External dependency mocked: batchRepository (DynamoDB-backed)
 *
 * Test design:
 *  - Equivalence classes for `pct`: valid mid-range, invalid negative, invalid >100
 *  - Boundary value analysis on the [0, 100] range: -1, 0, 1, 99, 100, 101
 *  - Negative/error case: batch not found, batch not in DRAFT status
 */
import { batchService } from './batch.service';
import { batchRepository } from './batch.repository';
import { AppError } from '../../middleware/error.middleware';
import { Batch } from '../../types';

jest.mock('./batch.repository');

const mockedRepo = batchRepository as jest.Mocked<typeof batchRepository>;

function draftBatch(overrides: Partial<Batch> = {}): Batch {
  return {
    batchId: 'BATCH-TEST01',
    factoryId: 'FAC-1',
    deviceId: 'DEV-1',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('batchService.setGoodLeafPercentage', () => {
  // --- Equivalence partitioning: valid class ---
  it('accepts a representative valid mid-range value (50)', async () => {
    mockedRepo.getById.mockResolvedValue(draftBatch());
    mockedRepo.updateGoodLeafPercentage.mockResolvedValue(
      draftBatch({ goodLeafPercentage: 50, status: 'READY_PHASE' })
    );

    const result = await batchService.setGoodLeafPercentage('BATCH-TEST01', 50);

    expect(result.goodLeafPercentage).toBe(50);
    expect(mockedRepo.updateGoodLeafPercentage).toHaveBeenCalledWith(
      'BATCH-TEST01',
      50,
      expect.any(String),
      'READY_PHASE'
    );
  });

  // --- Boundary value analysis on lower edge (0) ---
  it('accepts the lower boundary value 0', async () => {
    mockedRepo.getById.mockResolvedValue(draftBatch());
    mockedRepo.updateGoodLeafPercentage.mockResolvedValue(
      draftBatch({ goodLeafPercentage: 0, status: 'READY_PHASE' })
    );

    const result = await batchService.setGoodLeafPercentage('BATCH-TEST01', 0);
    expect(result.goodLeafPercentage).toBe(0);
  });

  // --- Boundary value analysis on upper edge (100) ---
  it('accepts the upper boundary value 100', async () => {
    mockedRepo.getById.mockResolvedValue(draftBatch());
    mockedRepo.updateGoodLeafPercentage.mockResolvedValue(
      draftBatch({ goodLeafPercentage: 100, status: 'READY_PHASE' })
    );

    const result = await batchService.setGoodLeafPercentage('BATCH-TEST01', 100);
    expect(result.goodLeafPercentage).toBe(100);
  });

  // --- Boundary value analysis: just outside lower edge (-1) ---
  it('rejects -1 (just below the valid range)', async () => {
    await expect(
      batchService.setGoodLeafPercentage('BATCH-TEST01', -1)
    ).rejects.toThrow(AppError);
    expect(mockedRepo.getById).not.toHaveBeenCalled();
  });

  // --- Boundary value analysis: just outside upper edge (101) ---
  it('rejects 101 (just above the valid range)', async () => {
    await expect(
      batchService.setGoodLeafPercentage('BATCH-TEST01', 101)
    ).rejects.toThrow(AppError);
  });

  // --- Error case: batch does not exist ---
  it('throws 404 when the batch does not exist', async () => {
    mockedRepo.getById.mockResolvedValue(null);

    await expect(
      batchService.setGoodLeafPercentage('BATCH-MISSING', 50)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  // --- Error case: batch exists but is in the wrong status ---
  it('throws 409 when the batch is not in DRAFT status', async () => {
    mockedRepo.getById.mockResolvedValue(draftBatch({ status: 'ONGOING' }));

    await expect(
      batchService.setGoodLeafPercentage('BATCH-TEST01', 50)
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
