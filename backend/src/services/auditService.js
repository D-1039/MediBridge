const auditRepository = require("../repositories/auditRepository");

const auditService = {
  async log({ userId, medicineId, action, description }) {
    return auditRepository.create({ userId, medicineId, action, description });
  },
};

module.exports = auditService;
