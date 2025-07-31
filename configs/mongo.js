'use strict'

import mongoose from "mongoose"

export const dbConnection = async () => {
    try{
        console.log(" Iniciando conexión a MongoDB...");
        console.log(" URI configurada:", process.env.URI_MONGO ? "✅ Sí" : "❌ No");
        
        mongoose.connection.on("error", () =>{
            console.log(" MongoDB | could not be connect to MongoDB")
            mongoose.disconnect()
        })
        mongoose.connection.on("connecting", () =>{
            console.log(" MongoDB | try connecting")
        })
        mongoose.connection.on("connected", () =>{
            console.log(" MongoDB | connected to MongoDB")
        })
        mongoose.connection.on("open", () =>{
            console.log(" MongoDB | Connnected to DataBase")
        })
        mongoose.connection.on("reconnected", () => {
            console.log(" MongoDB | reconnected to MongoDB")
        })
        mongoose.connection.on("disconnected", () => {
            console.log(" MongoDB | disconnected to MongoDB")
        })

        await mongoose.connect(process.env.URI_MONGO,{
            serverSelectionTimeoutMS: 30000, // 30 segundos
            socketTimeoutMS: 60000,          // 60 segundos
            bufferMaxEntries: 0,             // Desactivar buffer
            bufferCommands: false,           // Desactivar comandos en buffer
            maxPoolSize: 50,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            connectTimeoutMS: 30000
        })
        
    }catch(err){
        console.log(`Database connection failed: ${err}`)
    }
}