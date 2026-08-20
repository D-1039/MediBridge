const requestRepository = require("../repositories/requestRepository");
const requestStatusHistoryRepository = require("../repositories/requestStatusHistoryRepository");
const medicineRepository = require("../repositories/medicineRepository");
const inventorySearchService = require("./inventorySearchService");
const auditService = require("./auditService");
const { MEDICINE_STATUS, REQUEST_STATUS, AUDIT_ACTIONS } = require("../constants");
const {
  NotFoundError,
  ConflictError,
  ValidationError,
} = require("../utils/errors");

async function enrichRequest(row) {
  if (!row) return null;
  const history = await requestStatusHistoryRepository.findByRequestId(row.id);
  return { ...row, status_history: history };
}

async function recordStatus(requestId, status, userId, notes) {
  await requestStatusHistoryRepository.create({
    requestId,
    status,
    changedBy: userId,
    notes,
  });
}

async function validateMedicineForRequest(medicineId, requestedQuantity) {
  const medicine = await medicineRepository.findById(medicineId);
  if (!medicine || medicine.status !== MEDICINE_STATUS.APPROVED) {
    throw new ValidationError("Medicine is not verified or available for request");
  }

  if (medicine.expiry_date) {
    const expiry = new Date(medicine.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    if (expiry < today) {
      throw new ValidationError("Cannot request expired medicine");
    }
  }

  const availability = await medicineRepository.getAvailableQuantity(medicineId);
  const available = Number(availability?.available_quantity ?? 0);
  if (requestedQuantity > available) {
    throw new ValidationError(
      `Only ${available} unit(s) available. You requested ${requestedQuantity}.`
    );
  }

  return medicine;
}

const requestService = {
  async create({ receiverId, medicineId, requestedQuantity = 1, searchQuery }) {
    const qty = parseInt(requestedQuantity, 10);
    if (!qty || qty < 1) {
      throw new ValidationError("Requested quantity must be at least 1");
    }

    await validateMedicineForRequest(medicineId, qty);

    try {
      const request = await requestRepository.create({
        medicineId,
        receiverId,
        requestedQuantity: qty,
        searchQuery,
      });
      await recordStatus(
        request.id,
        REQUEST_STATUS.SUBMITTED,
        receiverId,
        "Request submitted by receiver"
      );
      await auditService.log({
        userId: receiverId,
        medicineId,
        action: AUDIT_ACTIONS.REQUEST_CREATED,
        description: `Receiver requested ${qty} unit(s)`,
      });
      return enrichRequest(await requestRepository.findById(request.id));
    } catch (err) {
      if (err.code === "23505") {
        throw new ConflictError("You already have an active request for this medicine");
      }
      throw err;
    }
  },

  async getById(id, userId, userRole) {
    const request = await requestRepository.findById(id);
    if (!request) throw new NotFoundError("Request not found");
    if (userRole === "receiver" && request.receiver_id !== userId) {
      throw new NotFoundError("Request not found");
    }
    return enrichRequest(request);
  },

  async listMyRequests(receiverId) {
    const rows = await requestRepository.findByReceiver(receiverId);
    return Promise.all(rows.map((row) => enrichRequest(row)));
  },

  async getReceiverStats(receiverId) {
    return requestRepository.getReceiverStats(receiverId);
  },

  async listAll() {
    const rows = await requestRepository.findAll({ limit: 100 });
    return Promise.all(rows.map((row) => enrichRequest(row)));
  },

  async listAllWithMatches() {
    const requests = await requestRepository.findAll({ limit: 100 });
    const results = [];
    for (const req of requests) {
      const enriched = await enrichRequest(req);
      try {
        const suggestions = await inventorySearchService.suggest(
          req.medicine_name,
          { limit: 1 }
        );
        const top = suggestions.suggestions[0];
        results.push({
          ...enriched,
          smart_match: top
            ? {
                medicine_id: top.medicine_id,
                medicine_name: top.medicine_name,
                available_quantity: top.available_quantity,
                distance_km: 0,
                match_score: top.match_score,
              }
            : null,
        });
      } catch (err) {
        console.error("Smart match failed for request", req.id, err.message);
        results.push({ ...enriched, smart_match: null });
      }
    }
    return results;
  },

  async review(requestId, userId) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError("Request not found");
    if (
      request.status !== REQUEST_STATUS.SUBMITTED &&
      request.status !== "pending"
    ) {
      throw new ConflictError("Request is not in submitted status");
    }
    await requestRepository.updateStatus(requestId, REQUEST_STATUS.UNDER_REVIEW);
    await recordStatus(
      requestId,
      REQUEST_STATUS.UNDER_REVIEW,
      userId,
      "Pharmacist started review"
    );
    return enrichRequest(await requestRepository.findById(requestId));
  },

  async assign(requestId, userId, { assignedMedicineId, assignedQuantity }) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError("Request not found");

    const qty = parseInt(assignedQuantity, 10) || request.requested_quantity;
    await validateMedicineForRequest(assignedMedicineId, qty);

    await requestRepository.assignMedicine({
      requestId,
      assignedMedicineId,
      assignedQuantity: qty,
      assignedBy: userId,
    });
    await recordStatus(
      requestId,
      REQUEST_STATUS.ASSIGNED,
      userId,
      `Assigned medicine ${assignedMedicineId}`
    );
    return enrichRequest(await requestRepository.findById(requestId));
  },

  async markReady(requestId, userId) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError("Request not found");
    if (
      request.status !== REQUEST_STATUS.ASSIGNED &&
      request.status !== "approved"
    ) {
      throw new ConflictError("Request must be assigned before marking ready");
    }
    await requestRepository.updateStatus(
      requestId,
      REQUEST_STATUS.READY_FOR_COLLECTION
    );
    await recordStatus(
      requestId,
      REQUEST_STATUS.READY_FOR_COLLECTION,
      userId,
      "Ready for collection"
    );
    return enrichRequest(await requestRepository.findById(requestId));
  },

  async approve(requestId, approverId) {
    return this.review(requestId, approverId);
  },

  async complete(requestId, userId) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError("Request not found");

    const allowed = [
      REQUEST_STATUS.ASSIGNED,
      REQUEST_STATUS.READY_FOR_COLLECTION,
      REQUEST_STATUS.UNDER_REVIEW,
      REQUEST_STATUS.SUBMITTED,
      "approved",
      "pending",
    ];
    if (!allowed.includes(request.status)) {
      throw new ConflictError("Request cannot be completed");
    }

    await requestRepository.updateStatus(requestId, REQUEST_STATUS.COMPLETED);
    await recordStatus(
      requestId,
      REQUEST_STATUS.COMPLETED,
      userId,
      "Distribution completed"
    );

    const medicineId = request.assigned_medicine_id || request.medicine_id;
    const deductQty =
      request.assigned_quantity || request.requested_quantity || 1;
    const medicine = await medicineRepository.findById(medicineId);
    if (medicine) {
      const newQty = Math.max(0, (medicine.quantity || 0) - deductQty);
      await medicineRepository.update(medicineId, {
        quantity: newQty,
        status:
          newQty === 0 ? MEDICINE_STATUS.DISTRIBUTED : medicine.status,
      });
    }

    await auditService.log({
      userId,
      medicineId,
      action: AUDIT_ACTIONS.DISTRIBUTED,
      description: "Medicine distribution completed",
    });

    return enrichRequest(await requestRepository.findById(requestId));
  },

  async reject(requestId, userId, notes) {
    const request = await requestRepository.findById(requestId);
    if (!request) throw new NotFoundError("Request not found");
    await requestRepository.updateStatus(requestId, REQUEST_STATUS.REJECTED);
    await recordStatus(
      requestId,
      REQUEST_STATUS.REJECTED,
      userId,
      notes || "Request rejected"
    );
    return enrichRequest(await requestRepository.findById(requestId));
  },

  async getAnalytics() {
    return requestRepository.getRequestAnalytics();
  },
};

module.exports = requestService;
