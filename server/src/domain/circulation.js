import { HttpError } from '../errors.js';
import { domainModels, OPEN, requestData } from './models.js';

const conflict = (message = 'This request or equipment has changed. Refresh and try again.') => new HttpError(409, 'STATE_CONFLICT', message);
const invalid = (message) => new HttpError(400, 'INVALID_INPUT', message);
const scope = (user) => user.role === 'ADMIN' ? {} : { studentId: user._id };
const samePayload = (row, input) => row.equipmentId.toString() === input.equipmentId && row.purpose === input.purpose && row.requestedDueAt.getTime() === input.requestedDueAt.getTime();

export function circulationService(connection, now = Date.now) {
  const { Equipment, BorrowingRequest } = domainModels(connection);
  async function replay(user, input, session = null) {
    const existing = await BorrowingRequest.findOne({ studentId: user._id, requestKey: input.requestKey }).session(session);
    if (!existing) return null;
    if (!samePayload(existing, input)) throw conflict('This request key was already used for different input.');
    return { data: requestData(existing), created: false };
  }
  return {
    async create(user, input) {
      const existing = await replay(user, input);
      if (existing) return existing;
      try {
        return await connection.transaction(async (session) => {
          const existing = await replay(user, input, session);
          if (existing) return existing;
          const time = new Date(now());
          if (input.requestedDueAt <= time) throw invalid('Choose a future return date.');
          const equipment = await Equipment.findById(input.equipmentId).session(session);
          if (!equipment || equipment.status === 'ARCHIVED') throw new HttpError(404, 'NOT_FOUND', 'Equipment not found.');
          if (equipment.status !== 'AVAILABLE') throw conflict('This equipment is not currently available.');
          if (await BorrowingRequest.exists({ studentId: user._id, equipmentId: equipment._id, status: { $in: OPEN } }).session(session)) throw conflict('You already have an open request for this equipment.');
          // Shared write serializes request creation with manual maintenance/archive guards.
          await Equipment.updateOne({ _id: equipment._id, version: equipment.version }, { $inc: { version: 1 } }, { session });
          const [row] = await BorrowingRequest.create([{
            ...input, studentId: user._id, assetSnapshot: { assetTag: equipment.assetTag, name: equipment.name },
            status: 'PENDING', events: [{ action: 'SUBMIT', actor: user._id, at: time }],
          }], { session });
          return { data: requestData(row), created: true };
        });
      } catch (error) {
        if (error.code === 11000) {
          const existing = await replay(user, input);
          if (existing) return existing;
        }
        throw error;
      }
    },
    async get(user, id) {
      const row = await BorrowingRequest.findOne({ _id: id, ...scope(user) });
      if (!row) throw new HttpError(404, 'NOT_FOUND', 'Request not found.');
      return requestData(row);
    },
    async list(user, input) {
      if (user.role !== 'ADMIN' && (input.overdue !== undefined || input.damage !== undefined)) throw invalid('These filters are for administrators.');
      const filter = { ...scope(user), ...(input.status ? { status: input.status } : {}) };
      const overdue = { status: 'ISSUED', dueAt: { $lt: new Date(now()) } };
      const damage = { 'damageReport.reportedAt': { $exists: true }, 'damageReport.reviewedAt': { $exists: false } };
      filter.$and = [];
      if (input.overdue !== undefined) filter.$and.push(input.overdue === 'true' ? overdue : { $nor: [overdue] });
      if (input.damage !== undefined) filter.$and.push(input.damage === 'true' ? damage : { $nor: [damage] });
      if (!filter.$and.length) delete filter.$and;
      const [rows, total] = await Promise.all([
        BorrowingRequest.find(filter).sort({ createdAt: -1, _id: -1 }).skip((input.page - 1) * input.limit).limit(input.limit),
        BorrowingRequest.countDocuments(filter),
      ]);
      return { data: rows.map(requestData), pagination: { page: input.page, limit: input.limit, total } };
    },
    async act(user, id, action, input) {
      return connection.transaction(async (session) => {
        const row = await BorrowingRequest.findOne({ _id: id, ...scope(user) }).session(session);
        if (!row) throw new HttpError(404, 'NOT_FOUND', 'Request not found.');
        const equipment = await Equipment.findById(row.equipmentId).session(session);
        if (!equipment) throw conflict();
        const time = new Date(now());
        const allocated = (status, requestStatus) => equipment.status === status && row.status === requestStatus && equipment.currentRequestId?.equals(row._id);
        let assetUpdate;
        switch (action) {
          case 'APPROVE':
            if (input.dueAt <= time || input.dueAt.getTime() > time.getTime() + 168 * 3600000) throw invalid('Return date must be future and within seven days of approval.');
            if (row.status !== 'PENDING' || row.requestedDueAt <= time || equipment.status !== 'AVAILABLE') throw conflict();
            row.status = 'APPROVED'; row.dueAt = input.dueAt;
            assetUpdate = { status: 'RESERVED', currentRequestId: row._id };
            break;
          case 'REJECT':
            if (row.status !== 'PENDING') throw conflict();
            row.status = 'REJECTED';
            break;
          case 'CANCEL':
            if (user.role === 'ADMIN' && !input.reason) throw invalid('An administrator cancellation requires a reason.');
            if (!['PENDING', 'APPROVED'].includes(row.status) || (user.role === 'ADMIN' && row.status !== 'APPROVED')) throw conflict();
            if (row.status === 'APPROVED') {
              if (!allocated('RESERVED', 'APPROVED')) throw conflict();
              assetUpdate = { status: 'AVAILABLE', currentRequestId: null };
            }
            row.status = 'CANCELLED';
            break;
          case 'ISSUE':
            if (!allocated('RESERVED', 'APPROVED') || !row.dueAt || row.dueAt <= time) throw conflict();
            row.status = 'ISSUED'; row.issuedAt = time;
            assetUpdate = { status: 'ISSUED', currentRequestId: row._id };
            break;
          case 'RETURN':
            if (!allocated('ISSUED', 'ISSUED')) throw conflict();
            if ((input.condition === 'DAMAGED' || row.damageReport) && !input.inspectionNote) throw invalid('An inspection note is required.');
            row.status = 'RETURNED'; row.returnedAt = time; row.returnCondition = input.condition; row.inspectionNote = input.inspectionNote || '';
            if (row.damageReport) Object.assign(row.damageReport, { reviewer: user._id, reviewedAt: time, inspectionResult: input.condition });
            assetUpdate = { status: input.condition === 'DAMAGED' ? 'MAINTENANCE' : 'AVAILABLE', currentRequestId: null, conditionNote: row.inspectionNote };
            break;
          case 'REPORT':
            if (row.status !== 'ISSUED' || row.damageReport) throw conflict();
            row.damageReport = { description: input.description, reporter: user._id, reportedAt: time };
            break;
          default: throw invalid('Unknown action.');
        }
        row.events.push({ action, actor: user._id, at: time, ...(input.reason ? { reason: input.reason } : {}) });
        if (assetUpdate) {
          const changed = await Equipment.updateOne({ _id: equipment._id, version: equipment.version }, { $set: { ...assetUpdate, updatedBy: user._id }, $inc: { version: 1 } }, { session, runValidators: true });
          if (!changed.matchedCount) throw conflict();
        }
        await row.save({ session });
        return requestData(row);
      });
    },
    async dashboard() {
      const [states, pending, issued, overdue, unreviewedDamage] = await Promise.all([
        Equipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        BorrowingRequest.countDocuments({ status: 'PENDING' }),
        BorrowingRequest.countDocuments({ status: 'ISSUED' }),
        BorrowingRequest.countDocuments({ status: 'ISSUED', dueAt: { $lt: new Date(now()) } }),
        BorrowingRequest.countDocuments({ 'damageReport.reportedAt': { $exists: true }, 'damageReport.reviewedAt': { $exists: false } }),
      ]);
      return { equipment: Object.fromEntries(states.map((state) => [state._id, state.count])), pending, issued, overdue, unreviewedDamage };
    },
  };
}
