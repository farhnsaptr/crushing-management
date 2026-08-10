import type { MasterPart } from '../../master-parts/types/masterParts.types';
import type { Factory } from '../../factories/types/factories.types';

export type FilterMode = 'jenis' | 'factory';

export interface CreateNgTransactionPayload {
  master_part_id: string;
  quantity_pcs: number;
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  notes?: string;
}

export interface NgTransactionResult {
  id: string;
  master_part_id: string;
  part_number_snapshot: string;
  part_name_snapshot: string;
  model_snapshot: string;
  berat_part_gr_snapshot: number;
  quantity_pcs: number;
  weight_kg: number;
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  input_by: string;
  notes?: string;
  created_at: string;
}

export type { MasterPart, Factory };
