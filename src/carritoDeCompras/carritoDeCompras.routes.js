import { Router } from "express";
import { agregarProductoCarrito, listarProductosCarrito, eliminarProductoCarrito} from "./CarritoDeCompras.controller.js";
import { agregarProductoAlCarritoValidator, listarProductoCarritoValidator, eliminarProductoDelCarritoValidator } from "../middlewares/carritoDeCompras-validators.js";

const router = Router();

router.post("/agregarProducto", agregarProductoAlCarritoValidator, agregarProductoCarrito);

router.get("/listarCarrito", listarProductoCarritoValidator, listarProductosCarrito);

router.delete("/eliminarProducto", eliminarProductoDelCarritoValidator, eliminarProductoCarrito);

export default router;