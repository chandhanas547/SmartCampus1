import { Router } from 'express';
import { requireRole, requireUser } from '../errors.js';
import { inventoryService } from './inventory.js';
import * as input from './validation.js';
import { circulationService } from './circulation.js';

export function domainRouter(connection, now) {
  const router = Router();
  const inventory = inventoryService(connection);
  const circulation = circulationService(connection, now);
  router.use(requireUser);
  router.get('/equipment', async (request, response) => response.json(await inventory.list(request.user, input.equipmentQuery.parse(request.query))));
  router.get('/equipment/:id', async (request, response) => {
    input.empty.parse(request.query);
    response.json({ data: await inventory.get(request.user, input.id.parse(request.params.id)) });
  });
  router.post('/equipment', requireRole('ADMIN'), async (request, response) => {
    input.empty.parse(request.query);
    response.status(201).json({ data: await inventory.create(request.user, input.createEquipmentInput.parse(request.body)) });
  });
  router.patch('/equipment/:id', requireRole('ADMIN'), async (request, response) => {
    input.empty.parse(request.query);
    response.json({ data: await inventory.update(request.user, input.id.parse(request.params.id), input.patchEquipmentInput.parse(request.body)) });
  });
  router.delete('/equipment/:id', requireRole('ADMIN'), async (request, response) => {
    input.empty.parse(request.query); input.empty.parse(request.body ?? {});
    await inventory.archive(request.user, input.id.parse(request.params.id));
    response.sendStatus(204);
  });
  router.post('/requests', requireRole('STUDENT'), async (request, response) => {
    input.empty.parse(request.query);
    const result = await circulation.create(request.user, input.createRequestInput.parse(request.body));
    response.status(result.created ? 201 : 200).json({ data: result.data });
  });
  router.get('/requests', async (request, response) => response.json(await circulation.list(request.user, input.requestQuery.parse(request.query))));
  router.get('/requests/:id', async (request, response) => {
    input.empty.parse(request.query);
    response.json({ data: await circulation.get(request.user, input.id.parse(request.params.id)) });
  });
  for (const [path, role, schema, action] of [
    ['decision', 'ADMIN', input.decisionInput, null],
    ['cancellation', null, input.cancellationInput, 'CANCEL'],
    ['issue', 'ADMIN', input.empty, 'ISSUE'],
    ['return', 'ADMIN', input.returnInput, 'RETURN'],
    ['damage-report', 'STUDENT', input.reportInput, 'REPORT'],
  ]) {
    router.post(`/requests/:id/${path}`, ...(role ? [requireRole(role)] : []), async (request, response) => {
      input.empty.parse(request.query);
      const values = schema.parse(request.body ?? {});
      const data = await circulation.act(request.user, input.id.parse(request.params.id), action || values.action, values);
      response.status(action === 'REPORT' ? 201 : 200).json({ data: action === 'REPORT' ? data.damageReport : data });
    });
  }
  router.get('/dashboard', requireRole('ADMIN'), async (request, response) => {
    input.empty.parse(request.query);
    response.json({ data: await circulation.dashboard() });
  });
  return router;
}
