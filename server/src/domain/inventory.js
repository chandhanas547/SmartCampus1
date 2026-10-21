import { HttpError } from '../errors.js';
import { domainModels, equipmentData, OPEN } from './models.js';

const conflict = () => new HttpError(409, 'STATE_CONFLICT', 'Equipment changed or has an open request. Refresh and try again.');
export function inventoryService(connection) {
  const { Equipment, BorrowingRequest } = domainModels(connection);
  return {
    async list(user, input) {
      const filter = {};
      if (user.role !== 'ADMIN') filter.status = { $ne: 'ARCHIVED' };
      if (input.status) filter.$and = [{ status: input.status }];
      if (input.category) filter.category = input.category;
      if (input.search) {
        const escaped = input.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = ['name', 'assetTag', 'category'].map((field) => ({ [field]: new RegExp(escaped, 'i') }));
      }
      const [rows, total] = await Promise.all([
        Equipment.find(filter).sort({ createdAt: -1, _id: -1 }).skip((input.page - 1) * input.limit).limit(input.limit),
        Equipment.countDocuments(filter),
      ]);
      return { data: rows.map(equipmentData), pagination: { page: input.page, limit: input.limit, total } };
    },
    async get(user, id) {
      const row = await Equipment.findOne({ _id: id, ...(user.role !== 'ADMIN' ? { status: { $ne: 'ARCHIVED' } } : {}) });
      if (!row) throw new HttpError(404, 'NOT_FOUND', 'Equipment not found.');
      return equipmentData(row);
    },
    async create(user, input) {
      return equipmentData(await Equipment.create({ ...input, updatedBy: user._id }));
    },
    async update(user, id, input) {
      return connection.transaction(async (session) => {
        const row = await Equipment.findById(id).session(session);
        if (!row) throw new HttpError(404, 'NOT_FOUND', 'Equipment not found.');
        if (row.version !== input.version || row.status === 'ARCHIVED') throw conflict();
        const updates = { updatedBy: user._id };
        if (input.action === 'EDIT_METADATA') {
          for (const key of ['name', 'category', 'description', 'location', 'conditionNote']) if (input[key] !== undefined) updates[key] = input[key];
        } else if (input.action === 'ENTER_MAINTENANCE') {
          if (row.status !== 'AVAILABLE' || row.currentRequestId || await BorrowingRequest.exists({ equipmentId: row._id, status: { $in: OPEN } }).session(session)) throw conflict();
          Object.assign(updates, { status: 'MAINTENANCE', conditionNote: input.note });
        } else {
          if (row.status !== 'MAINTENANCE' || row.currentRequestId) throw conflict();
          Object.assign(updates, { status: 'AVAILABLE', conditionNote: input.note });
        }
        const updated = await Equipment.findOneAndUpdate({ _id: id, version: row.version }, { $set: updates, $inc: { version: 1 } }, { returnDocument: 'after', session, runValidators: true });
        if (!updated) throw conflict();
        return equipmentData(updated);
      });
    },
    async archive(user, id) {
      await connection.transaction(async (session) => {
        const row = await Equipment.findById(id).session(session);
        if (!row) throw new HttpError(404, 'NOT_FOUND', 'Equipment not found.');
        if (!['AVAILABLE', 'MAINTENANCE'].includes(row.status) || row.currentRequestId || await BorrowingRequest.exists({ equipmentId: id, status: { $in: OPEN } }).session(session)) throw conflict();
        const update = await Equipment.updateOne({ _id: id, version: row.version }, { $set: { status: 'ARCHIVED', updatedBy: user._id }, $inc: { version: 1 } }, { session });
        if (!update.matchedCount) throw conflict();
      });
    },
  };
}
