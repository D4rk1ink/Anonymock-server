import { Request, Response, preResponse } from '../utils/express.util'
import { User } from '../models/user'

const verifyAccessed = async (req: Request, res: Response) => {
    const { id } = req.body
    const my = await User.findById(req.certificate.id)
    return my && my.isAdmin && my.id !== id
}

export const getAll = async (req: Request, res: Response) => {
    if (await verifyAccessed(req, res)) {
        const users = await User.findAll({}, 'id firstname lastname isAdmin isApproved deactivated')
        res.json(preResponse.data(users))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const getById = async (req: Request, res: Response) => {
    if (await verifyAccessed(req, res)) {
        try {
            const { id } = req.params
            const user = await User.findById(id, 'id firstname lastname isAdmin isApproved deactivated')
            res.json(preResponse.data(user))
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const approve = async (req: Request, res: Response) => {
    if (await verifyAccessed(req, res)) {
        try {
            const { id, approve } = req.body
            const user = await User.findById(id)
            if (approve && user && !user.isApproved) {
                const user = await User.update(id, { isApproved: approve })
                res.json(preResponse.data('Approve user successfully'))
            } else if (!approve && user && !user.isApproved) {
                const user = await User.findById(id)
                if (user && !user.isApproved) {
                    await User.remove(id)
                    res.json(preResponse.data('Remove user successfully'))
                }
            } else {
                res.json(preResponse.error(null, 'User not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Approve fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const admin = async (req: Request, res: Response) => {
    if (await verifyAccessed(req, res)) {
        try {
            const { id, isAdmin } = req.body
            const user = await User.update(id, { isAdmin: isAdmin })
            res.json(preResponse.data('Successfully'))
        } catch (err) {
            res.json(preResponse.error(null, 'Update Admin fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const deactivate = async (req: Request, res: Response) => {
    if (await verifyAccessed(req, res)) {
        try {
            const { id, deactivated } = req.body
            const user = await User.update(id, { deactivated: deactivated })
            res.json(preResponse.data('Successfully'))
        } catch (err) {
            res.json(preResponse.error(null, 'Update Deactivated fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}