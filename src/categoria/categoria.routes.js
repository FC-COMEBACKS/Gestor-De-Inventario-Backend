import { Router } from "express";
import { crearCategoria, listarCategorias, editarCategoria, eliminarCategoria } from "./categoria.controller.js";
import { createCategoriaValidator, listarCategoriasValidator, editarCategoriaValidator, eliminarCategoriaValidator  } from "../middlewares/categoria-validators.js";

const router = Router()

router.post("/crearCategoria", createCategoriaValidator, crearCategoria)

router.get("/listarCategorias", listarCategoriasValidator, listarCategorias)

router.put("/editarCategoria/:uid", editarCategoriaValidator, editarCategoria)

router.delete("/eliminarCategoria/:uid", eliminarCategoriaValidator, eliminarCategoria)

export default router