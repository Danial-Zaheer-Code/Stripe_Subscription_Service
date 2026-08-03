import * as planServices from '../services/planServices.js';

export async function createPlan(req, res) {
    const plan = req.body;
    const result = await planServices.createPlan(plan);
    return res.status(result.status).json(result);
}

export async function getAllPlans(req, res) {
    const result = await planServices.getAllPlans();
    return res.status(result.status).json(result);
}

export async function deletePlan(req, res) {
    const { id } = req.body;
    const result = await planServices.deletePlan(id);
    return res.status(result.status).json(result);
}