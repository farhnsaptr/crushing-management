/**
 * Fragment JOIN runner_material_transactions (alias rmt) -> v_all_materials (alias mm).
 * Id dipakai lebih dulu; nama snapshot hanya sebagai fallback bila id kosong, sehingga
 * satu transaksi hanya cocok ke satu material (tidak terhitung dobel).
 */
export const RUNNER_MATERIAL_JOIN_SQL = `
  LEFT JOIN v_all_materials mm ON mm.id = COALESCE(
    rmt.material_id,
    (SELECT vm.id FROM v_all_materials vm WHERE vm.material_name = rmt.material_name_snapshot LIMIT 1)
  )`;
