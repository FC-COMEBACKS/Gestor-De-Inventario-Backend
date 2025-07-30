import jwt from "jsonwebtoken"
import User from "../user/user.model.js"

export const validateJWT = async (req, res, next) => {
    try{
        let token = req.headers["authorization"]

        if(!token){
            return res.status(401).json({
                success: false,
                message: "No existe token en la petición"
            })
        }

        if(token.startsWith('Bearer ')){
            token = token.slice(7, token.length);
        }

        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
        
        const user = await User.findById(decoded.uid)

        if(!user){
           return res.status(401).json({
                success: false,
                message: "Usuario no existe en la DB"
           }) 
        }

        if(user.status === false){
            return res.status(401).json({
                success: false,
                message: "Usuario desactivado previamente"
            })
        }

        req.usuario = user
        next()
        
    }catch(error){
        return res.status(401).json({
            success: false,
            message: "Token no válido",
            error: error.message
        })
    }
}