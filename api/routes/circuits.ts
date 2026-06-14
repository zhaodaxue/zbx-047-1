import { Router, type Request, type Response } from 'express'
import { getCircuitStats } from '../store.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const stats = getCircuitStats()
  res.json({ success: true, data: stats })
})

export default router
