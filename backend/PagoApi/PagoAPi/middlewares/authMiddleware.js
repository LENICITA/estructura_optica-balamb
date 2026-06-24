// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Función para verificar el token
function verifyToken(req, res, next) {
    // Obtener el header Authorization
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
        return res.status(403).json({
            success: false,
            message: "No se proporcionó un token",
        });
    }
    
    // Extraer el token (después de "Bearer ")
    const token = authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(403).json({
            success: false,
            message: "Formato de token inválido. Use: Bearer <token>",
        });
    }
    
    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET || 'miClaveSecreta123', (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Token inválido o expirado",
                error: err.message,
            });
        }
        // Guardar la información del usuario en la petición
        req.user = decoded;
        next();
    });
}

// Función para verificar roles
function authorizeRoles(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "No autenticado",
            });
        }
        
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado: se requiere rol ${roles.join(" o ")}`,
            });
        }
        next();
    };
}

// Versión simple sin roles (para pruebas)
function verifyTokenSimple(req, res, next) {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
        return res.status(403).json({
            success: false,
            message: "No se proporcionó un token",
        });
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(403).json({
            success: false,
            message: "Formato de token inválido",
        });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'miClaveSecreta123', (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Token inválido o expirado",
            });
        }
        req.user = decoded;
        next();
    });
}

module.exports = {
    verifyToken,
    authorizeRoles,
    verifyTokenSimple
};