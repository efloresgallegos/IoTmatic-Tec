import 'dotenv/config'
import jwt from 'jwt-simple'
import moment from 'moment'
const secret = process.env.SECRET_JWT || ''

const createUserToken = (obj) => {
    let payload = {
        id: obj.id,
        username: obj.username,
        iat: moment().unix(),
        exp: moment().add(2, 'hours').unix()
    }
    return jwt.encode(payload, secret)
}

const createDataToken = (obj) => {
    let payload = {
        model: obj.model_id,
        device: obj.device_id,
        user: obj.user_id,
        iat: moment().unix(),
        exp: moment().add(365, 'days').unix()
    }
    return jwt.encode(payload, secret)
}
const jwtMethods = {
    createUserToken,
    createDataToken
}

export default jwtMethods