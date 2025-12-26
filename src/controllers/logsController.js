import {Log} from '../model/Log'

export const getMyVisitors = async (req, res) => {
    try {

        const logs = await Log.find()

        if (logs.length === 0) {
            return res.status(403).json({ success: false, data: "There are no logs at the momemt" })
        }

        return res.status(200).json({ success: true, data: logs })
        
    } catch (error) {

        return res.status(200).json({ message:`Error while reading database: ${error.message}` })
    }
}