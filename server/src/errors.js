export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function requireUser(request, _response, next) {
  if (!request.user) throw new HttpError(401, 'AUTH_REQUIRED', 'Please sign in to continue.');
  next();
}

export function requireRole(role) {
  return (request, response, next) => {
    requireUser(request, response, () => {});
    if (request.user.role !== role) throw new HttpError(403, 'FORBIDDEN', 'You do not have access to this action.');
    next();
  };
}
