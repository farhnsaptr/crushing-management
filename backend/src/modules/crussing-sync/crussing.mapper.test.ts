import test from 'node:test';
import assert from 'node:assert/strict';
import {
 mapToRawProductionRecord,
 mapToRunnerRow,
 parseLocationMap,
 pctTotal,
 resolveExternalLocation,
} from './crussing.mapper';

const record = {
 sebango: 'U0-5036/7-202B',
 shift: 'D',
 date: '2026-10-30 08:00:00',
 factory: 'F4',
 machine_no: 'MC1',
 tonnage: '350 T',
 act_total_pcs: 268,
 act_ok_pcs: 263,
 ng_total_pcs: 5,
 ok_use_pct: 97.16,
 ng_loss_pct: 1.847,
 runner_pct: 0.991,
 dango_pct: 0.002,
 dango_part_pct: 0,
};

test('parseLocationMap + resolveExternalLocation', () => {
 const map = parseLocationMap('Cibitung=SC1, Karawang=SC2');
 assert.equal(map.get('Cibitung'), 'SC1');
 assert.equal(map.get('Karawang'), 'SC2');
 assert.equal(resolveExternalLocation(map, 'Cibitung'), 'SC1');
 assert.equal(resolveExternalLocation(map, 'Bandung'), null);
});

test('pctTotal menjumlahkan 5 komponen', () => {
 assert.ok(Math.abs(pctTotal(record) - 100) < 0.01);
});

test('mapToRawProductionRecord memetakan field dan persentase', () => {
 const mapped = mapToRawProductionRecord(record);
 assert.equal(mapped.date, '2026-10-30');
 assert.equal(mapped.sebango, 'U0-5036/7-202B');
 assert.equal(mapped.shift, 'D');
 assert.equal(mapped.act_total, 268);
 assert.equal(mapped.ok_use_pct, 97.16);
 assert.equal(mapped.budomari_pct, 97.16);
});

test('mapToRawProductionRecord: persentase nol semua -> NULL', () => {
 const mapped = mapToRawProductionRecord({
 ...record,
 ok_use_pct: 0,
 ng_loss_pct: 0,
 runner_pct: 0,
 dango_pct: 0,
 dango_part_pct: 0,
 });
 assert.equal(mapped.ok_use_pct, null);
 assert.equal(mapped.budomari_pct, null);
});

test('mapToRunnerRow hanya untuk data valid', () => {
 assert.deepEqual(mapToRunnerRow(record), {
 date: '2026-10-30',
 sebango_code: 'U0-5036/7-202B',
 shift: 'D',
 act_total_pcs: 268,
 });
 assert.equal(mapToRunnerRow({ ...record, act_total_pcs: 0 }), null);
 assert.equal(mapToRunnerRow({ ...record, sebango: '' }), null);
});
