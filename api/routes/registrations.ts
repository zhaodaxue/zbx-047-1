import { Router, type Request, type Response } from 'express'
import { getRegistrations, createRegistration } from '../store.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { circuitGroup, halfDay } = req.query
  const results = getRegistrations({
    circuitGroup: circuitGroup as string | undefined,
    halfDay: halfDay as string | undefined,
  })
  res.json({ success: true, data: results })
})

router.post('/', (req: Request, res: Response) => {
  const { circuitGroup, boothNumber, wattage, halfDay } = req.body

  if (!circuitGroup || !boothNumber || !wattage || !halfDay) {
    res.status(400).json({
      success: false,
      error: '缺少必填字段：circuitGroup, boothNumber, wattage, halfDay',
    })
    return
  }

  if (!['甲', '乙', '丙'].includes(circuitGroup)) {
    res.status(400).json({
      success: false,
      error: '电路组必须为甲、乙、丙之一',
    })
    return
  }

  if (!['上午', '下午'].includes(halfDay)) {
    res.status(400).json({
      success: false,
      error: '半天时段必须为上午或下午',
    })
    return
  }

  if (typeof wattage !== 'number' || wattage <= 0) {
    res.status(400).json({
      success: false,
      error: '瓦数必须为正数',
    })
    return
  }

  const result = createRegistration({
    circuitGroup,
    boothNumber,
    wattage,
    halfDay,
  })

  if ('error' in result) {
    res.status(409).json({ success: false, error: result.error })
    return
  }

  res.status(201).json({ success: true, data: result })
})

export default router
