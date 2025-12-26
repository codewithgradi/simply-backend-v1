export const setTenant = (req, res, next) => {
    
    if (!req.user) {
        return res.status(403).json({ 
            message: 'No company context found: User is not authenticated' 
        });
    }
    const companyId = req.user?._id;

    if (!companyId) return res.status(403).json({ message: 'No company context found' })
    
    req.tenantId = companyId.toString()
    next()
}

export const setTenantFromPost = (req, res, next) => {
    // Grab the ID from the body instead of the auth token
    const companyId = req.body.companyId;

    if (!companyId) {
        return res.status(412).json({ message: "Missing Business ID" });
    }

    // Attach it to the request so the rest of your app (and checkIn) can see it
    req.tenantId = companyId;
    next();
};