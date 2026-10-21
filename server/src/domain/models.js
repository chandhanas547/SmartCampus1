import { Schema } from 'mongoose';

export const OPEN = ['PENDING', 'APPROVED', 'ISSUED'];
export const EQUIPMENT_STATES = ['AVAILABLE', 'RESERVED', 'ISSUED', 'MAINTENANCE', 'ARCHIVED'];
export const REQUEST_STATES = [...OPEN, 'REJECTED', 'CANCELLED', 'RETURNED'];

export function domainModels(connection) {
  const equipmentSchema = new Schema({
    assetTag: { type: String, required: true, unique: true, immutable: true, maxlength: 40 },
    name: { type: String, required: true, maxlength: 120 },
    category: { type: String, required: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 2000 },
    location: { type: String, required: true, maxlength: 120 },
    status: { type: String, enum: EQUIPMENT_STATES, default: 'AVAILABLE', required: true },
    currentRequestId: { type: Schema.Types.ObjectId, default: null },
    conditionNote: { type: String, default: '', maxlength: 2000 },
    updatedBy: { type: Schema.Types.ObjectId, required: true },
    version: { type: Number, default: 0, min: 0 },
  }, { timestamps: true, versionKey: false, strict: 'throw' });
  equipmentSchema.index({ status: 1, category: 1, createdAt: -1, _id: -1 });
  const requestSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, required: true },
    equipmentId: { type: Schema.Types.ObjectId, required: true },
    assetSnapshot: { assetTag: String, name: String },
    requestKey: { type: String, required: true },
    purpose: { type: String, required: true, maxlength: 500 },
    requestedDueAt: { type: Date, required: true },
    dueAt: Date,
    status: { type: String, enum: REQUEST_STATES, default: 'PENDING', required: true },
    issuedAt: Date, returnedAt: Date,
    returnCondition: { type: String, enum: ['SERVICEABLE', 'DAMAGED'] },
    inspectionNote: { type: String, maxlength: 2000 },
    // Embedded records share the request's optimistic version; they have no independent __v.
    events: [new Schema({ action: String, actor: Schema.Types.ObjectId, at: Date, reason: String }, { _id: false, versionKey: false, strict: 'throw' })],
    damageReport: {
      type: new Schema({ description: { type: String, maxlength: 2000 }, reporter: Schema.Types.ObjectId, reportedAt: Date, reviewer: Schema.Types.ObjectId, reviewedAt: Date, inspectionResult: { type: String, enum: ['SERVICEABLE', 'DAMAGED'] } }, { _id: false, versionKey: false, strict: 'throw' }),
      default: undefined,
    },
  }, { timestamps: true, strict: 'throw', optimisticConcurrency: true });
  requestSchema.index({ studentId: 1, requestKey: 1 }, { unique: true });
  requestSchema.index({ studentId: 1, equipmentId: 1 }, { unique: true, partialFilterExpression: { status: { $in: OPEN } } });
  requestSchema.index({ equipmentId: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['APPROVED', 'ISSUED'] } } });
  requestSchema.index({ studentId: 1, createdAt: -1, _id: -1 });
  requestSchema.index({ status: 1, dueAt: 1 });
  return {
    Equipment: connection.models.Equipment || connection.model('Equipment', equipmentSchema),
    BorrowingRequest: connection.models.BorrowingRequest || connection.model('BorrowingRequest', requestSchema),
  };
}

export async function prepareDomain(connection) {
  const models = domainModels(connection);
  await Promise.all(Object.values(models).map((model) => model.init()));
}

export function equipmentData(row) {
  return Object.fromEntries(['id', 'assetTag', 'name', 'category', 'description', 'location', 'status', 'conditionNote', 'version'].map((key) => [key, key === 'id' ? row._id.toString() : row[key]]));
}

export function requestData(row) {
  const data = row.toObject();
  const id = data._id.toString();
  delete data._id;
  delete data.__v;
  return { id, ...data };
}
