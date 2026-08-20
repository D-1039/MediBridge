const Fuse = require("fuse.js");
const medicineRepository = require("../repositories/medicineRepository");

function toMatchScore(fuseScore) {
  const normalized = Math.max(0, Math.min(1, 1 - (fuseScore ?? 0)));
  return Math.round(normalized * 100);
}

function mapInventoryItem(medicine) {
  return {
    medicine_id: medicine.id,
    medicine_name: medicine.medicine_name,
    dosage: medicine.dosage,
    batch_number: medicine.batch_number,
    expiry_date: medicine.expiry_date,
    available_quantity: Number(medicine.available_quantity ?? medicine.quantity ?? 0),
    verification_status: "verified",
    image_url: medicine.image_url,
    donor_name: medicine.donor_name,
  };
}

const inventorySearchService = {
  async listAvailable({ limit = 50 } = {}) {
    const inventory = await medicineRepository.findAvailableInventory({ limit: 200 });
    return inventory.slice(0, limit).map((item) => ({
      ...mapInventoryItem(item),
      match_score: 100,
    }));
  },

  async search(query, { limit = 10 } = {}) {
    const inventory = await medicineRepository.findAvailableInventory({ limit: 500 });
    const trimmed = (query || "").trim();

    const inventoryPreview = inventory.slice(0, 10).map((item) => ({
      id: item.id,
      medicine_name: item.medicine_name,
      dosage: item.dosage,
      batch_number: item.batch_number,
      quantity: item.quantity,
      available_quantity: item.available_quantity,
      status: item.status,
      donor_name: item.donor_name,
    }));

    try {
      console.debug("inventorySearchService.search called", {
        query: String(query),
        trimmed,
        inventoryCount: inventory.length,
        inventoryPreview,
      });
    } catch (e) {
      /* ignore logging errors */
    }

    if (!trimmed) {
      return inventory.slice(0, limit).map((item) => ({
        ...mapInventoryItem(item),
        match_score: 100,
      }));
    }

    const fuse = new Fuse(inventory, {
      keys: ["medicine_name", "dosage", "batch_number"],
      threshold: 0.45,
      includeScore: true,
      ignoreLocation: true,
    });

    const raw = fuse.search(trimmed).slice(0, limit);
    const results = raw.map((result) => ({
      ...mapInventoryItem(result.item),
      match_score: toMatchScore(result.score),
    }));

    try {
      console.debug("inventorySearchService.search results", {
        query: trimmed,
        returned: results.length,
        top: results.slice(0, 3).map((r) => ({ name: r.medicine_name, score: r.match_score })),
      });
    } catch (e) {
      /* ignore logging errors */
    }

    return results;
  },

  async suggest(query, { limit = 5 } = {}) {
    const results = await this.search(query, { limit });
    return {
      query: (query || "").trim(),
      suggestions: results.sort((a, b) => b.match_score - a.match_score),
    };
  },
};

module.exports = inventorySearchService;
