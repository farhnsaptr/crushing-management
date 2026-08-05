import { Request, Response } from 'express';
import { MachinesService } from './machines.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class MachinesController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const machines = await MachinesService.listMachines();
      sendSuccess(res, machines, 'Machines retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve machines', 500);
    }
  }

  static async getByFactory(req: Request, res: Response): Promise<void> {
    try {
      const factoryId = String(req.params.factory_id);
      const machines = await MachinesService.getMachinesByFactory(factoryId);
      sendSuccess(res, machines, 'Machines for factory retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve machines by factory', 500);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const machine = await MachinesService.getMachineById(id);
      if (!machine) {
        sendError(res, 'Machine not found', 404);
        return;
      }
      sendSuccess(res, machine, 'Machine retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve machine', 500);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { factory_id, code, name, type, tonnage, status } = req.body;
      if (!factory_id || !code || !name) {
        sendError(res, 'factory_id, code, and name are required', 400);
        return;
      }

      const machine = await MachinesService.createMachine({ factory_id, code, name, type, tonnage, status });
      sendSuccess(res, machine, 'Machine created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create machine', 400);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { factory_id, code, name, type, tonnage, status } = req.body;
      const updated = await MachinesService.updateMachine(id, { factory_id, code, name, type, tonnage, status });
      sendSuccess(res, updated, 'Machine updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update machine', 400);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await MachinesService.deleteMachine(id);
      sendSuccess(res, result, 'Machine deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete machine', 400);
    }
  }
}
