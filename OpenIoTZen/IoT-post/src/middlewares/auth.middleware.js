import jwt from 'jwt-simple';
import 'dotenv/config';

const secret = process.env.SECRET_JWT || '';

export const verifyToken = (req, res, next) => {
    try {
        // Obtener el token del header
        const token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
        }

        // Eliminar 'Bearer ' si está presente
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

        try {
            // Decodificar el token
            const decoded = jwt.decode(cleanToken, secret);
            
            // Verificar si el token ha expirado
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                return res.status(401).json({ message: 'Token expirado' });
            }
            
            // Agregar los datos decodificados a la request
            req.tokenData = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error al verificar el token' });
    }
};
