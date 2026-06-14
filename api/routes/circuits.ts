import { Router, type Request, type Response } from 'express'
import { getCircuitStats } from '../store.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { halfDay } = req.query
  const stats = getCircuitStats(halfDay as string | undefined)
  res.json({ success: true, data: stats })
})

export default router
