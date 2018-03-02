import { Request, Response, preResponse } from '../utils/express.util'
import { User } from '../models/user'
import * as verify from './verify.controller'

export const search = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res)) {
        const { search } = req.query
        const users = await User.searchUser(search, 0, 'id firstname lastname isAdmin isApproved deactivated')
        res.json(preResponse.data(users))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const getById = async (req: Request, res: Response) => {
    const id = req.params.id
    if (await verify.verifyMyself(id, req)) {
        try {
            const user = await User.findById(id, 'id firstname lastname email isAdmin')
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

export const picture = async (req: Request, res: Response) => {
    const id = req.params.id
    try {
        const user = await User.findById(id, 'picture')
        if (user) {
            const base64 = user.picture.split(",")
            if (base64.length > 1) {
                const img = new Buffer(base64[1], 'base64');
                res
                    .writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': img.length
                    })
                res.end(img)
            }
            
        }
    } catch (err) {
        res.json(preResponse.error(null, err.message))
    }
}

export const uploadPicture = async (req: Request, res: Response) => {
    const id = req.params.id
    if (await verify.verifyMyself(id, req)) {
        try {
            const { picture } = req.body
            await User.update(id, { picture })
            res.json(preResponse.data('Successfully'))
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const update = async (req: Request, res: Response) => {
    const id = req.params.id
    if (await verify.verifyMyself(id, req)) {
        try {
            const { firstname, lastname, email } = req.body
            await User.update(id, { firstname, lastname, email })
            const user = await User.findById(id, 'id firstname lastname email isAdmin')
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
    const id = req.params.id
    if (await verify.verifyAdmin(req, res) || !await verify.verifyMyself(id, req)) {
        try {
            const { approve } = req.body
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
    const id = req.params.id
    if (await verify.verifyAdmin(req, res) || !await verify.verifyMyself(id, req)) {
        try {
            const { isAdmin } = req.body
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
    const id = req.params.id
    if (await verify.verifyAdmin(req, res) || !await verify.verifyMyself(id, req)) {
        try {
            const { deactivated } = req.body
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