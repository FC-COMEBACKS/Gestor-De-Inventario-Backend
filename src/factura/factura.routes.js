import { Router } from "express";
import { procesarCompra, editarFactura, anularFactura, obtenerFacturasPorUsuario, obtenerFactura, descargarFacturaPDF } from "./factura.controller.js";
import { procesarCompraValidator, editarFacturaValidator, anularFacturaValidator, obtenerFacturasPorUsuarioValidator } from "../middlewares/factura-validators.js";

const router = Router();

router.post("/procesarCompra", procesarCompraValidator, procesarCompra);

router.put("/editarFactura/:idFactura", editarFacturaValidator, editarFactura);

router.patch("/anularFactura/:idFactura", anularFacturaValidator, anularFactura);

router.get("/obtenerFacturasPorUsuario", obtenerFacturasPorUsuarioValidator, obtenerFacturasPorUsuario);

router.get("/obtenerFactura/:idFactura", obtenerFacturasPorUsuarioValidator, obtenerFactura);

router.get("/descargarPDF/:idFactura", obtenerFacturasPorUsuarioValidator, descargarFacturaPDF);

export default router;