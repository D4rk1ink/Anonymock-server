import { Request, Response } from '../utils/express.util'
import { ProjectPosition } from '../models/project-position'

export const get = async (req: Request, res: Response) => {
    const projectPosition = await ProjectPosition.findAll()
    return res.json(projectPosition)
}