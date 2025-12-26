import jwt from 'jsonwebtoken';
import {Company} from '../model/Company.js';

const getToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
        return req.cookies.jwt;
    }
    return null;
};

const authCompanyMiddleware = async (req, res, next) => {
    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ error: 'Not Authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRETE);

        const company = await Company.findById(decoded.id).select('-password');

        if (!company) {
            return res.status(401).json({ error: "Company account no longer exists" });
        }
        req.user = company;

        req.tenantId = company._id.toString();

        next();
    } catch (error) {
        return res.status(401).json({ error: "Not authorized, token failed" });
    }
};


const authSystemMiddleware = async (req, res, next) => {
    const token = getToken(req); 

    if (!token) {
        return res.status(401).json({ error: 'Not Authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRETE);

        console.log("TOKEN ID:", decoded.id);
        console.log("ENV SYS_ID:", process.env.SYS_ID);
        console.log("MATCH?", decoded.id === process.env.SYS_ID);
        
        if (decoded.id !== process.env.SYS_ID && decoded.id !== 'SYSTEM_ADMIN') {
            return res.status(403).json({ error: "Access denied: Not a System Admin" });
        }

        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token expired or invalid" });
    }
};

export {authCompanyMiddleware,authSystemMiddleware}