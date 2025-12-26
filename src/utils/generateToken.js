import jwt from 'jsonwebtoken'

export const generateToken = (companyId, res) => {
    const idString = companyId.toString(); 
    
    const payLoad = { id: idString };
    
    const token = jwt.sign(payLoad, process.env.JWT_SECRETE, {
        expiresIn: process.env.JWT_EXPIRES || '6d'
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path:'/',
        maxAge: 1000 * 60 * 60 * 12,
    });

    return token;
}
