import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options ={
    swaggerDefinition:{
        openapi:"3.0.0",
        info:{
            title: "Gestor de ventas API",
            version: "1.0.0",
            description: "Gestor de inventario proyecto final",
            contact:{
                name: "FCCOMEBACKS",
                email: "FCComebacks@gmail.com"
            }
        },
        servers:[
            {
                url: "http://127.0.0.1:3002/gestor-de-inventario/v1"
            }
        ]
    },
    apis:[
        "./src/auth/auth.routes.js",
        "./src/user/user.routes.js",
        "./src/categoria/categoria.routes.js",
        "./src/productos/productos.routes.js",
        "./src/carritoDeCompras/carritoDeCompras.routes.js",
        "./src/factura/factura.routes.js"
    ]
}

const swaggerDocs = swaggerJSDoc(options)

export { swaggerDocs, swaggerUi}