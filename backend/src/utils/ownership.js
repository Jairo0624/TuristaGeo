const AppError = require('./AppError');

// Solo el autor de un registro puede modificarlo o eliminarlo. Si no lo es, 403 (prohibido).
// `ownerId` puede ser un ObjectId o un documento ya poblado; se compara siempre como texto.
exports.ensureOwner = (ownerId, userId, message = 'Solo su autor puede modificarlo o eliminarlo') => {
  if (String(ownerId?._id ?? ownerId) !== String(userId)) throw new AppError(message, 403);
};
