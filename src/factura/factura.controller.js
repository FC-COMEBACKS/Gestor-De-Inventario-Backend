import Factura from './factura.model.js';
import CarritoDeCompras from '../carritoDeCompras/carritoDeCompras.model.js';
import Producto from '../productos/productos.model.js';
import PDFDocument from 'pdfkit';

export const procesarCompra = async (req, res) => {
    try {
        const { usuario } = req;

        const carrito = await CarritoDeCompras.findOne({ idUsuario: usuario._id }).populate("productos.idProducto");

        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El carrito de compras está vacío"
            });
        };

        const productosFactura = carrito.productos.map(producto => ({
            idProducto: producto.idProducto._id,
            nombreProducto: producto.idProducto.nombreProducto,
            cantidad: producto.cantidad,
            precioProducto: producto.precioProducto
        }))

        const factura = new Factura({
            idUsuario: usuario._id,
            productos: productosFactura,
            total: carrito.cantidadTotal
        })

        await factura.save();

        let totalProductosVendidos = 0;
        for (const producto of carrito.productos) {
            const productoDB = await Producto.findById(producto.idProducto._id);
            if (productoDB) {
                productoDB.stock -= producto.cantidad;
                productoDB.vendidos += producto.cantidad;
                await productoDB.save();
                totalProductosVendidos += producto.cantidad;
            }
        }

        carrito.productos = [];
        carrito.cantidadTotal = 0;
        await carrito.save();

        const facturaConUsuario = await Factura.findById(factura._id).populate('idUsuario', 'name surname email');

        return res.status(200).json({
            success: true,
            message: "Compra procesada exitosamente",
            factura: {
                id: factura._id,
                total: factura.total,
                fecha: factura.fecha,
                estado: factura.estado,
                cliente: facturaConUsuario.idUsuario ? `${facturaConUsuario.idUsuario.name} ${facturaConUsuario.idUsuario.surname}` : 'Cliente no disponible',
                productos: facturaConUsuario.productos
            },
            totalProductosVendidos,
            downloadUrl: `/factura/descargarPDF/${factura._id}`
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al procesar la compra",
            error: err.message
        });
    };
}

export const editarFactura = async (req, res) => {
    try {
        const { idFactura } = req.params;
        const { productos } = req.body;
        const { usuario } = req;

        const factura = await Factura.findById(idFactura);
        if (!factura) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        if (usuario.role !== "ADMIN_ROLE" && factura.idUsuario.toString() !== usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para editar esta factura"
            });
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "La lista de productos es inválida o está vacía"
            });
        };

        for (let producto of factura.productos) {
            let productoDB = await Producto.findById(producto.idProducto);
            if (productoDB) {
                productoDB.stock += producto.cantidad; 
                productoDB.vendidos -= producto.cantidad; 
                await productoDB.save();
            }
        }

        factura.productos = productos.map(producto => {
            if (!producto.idProducto || !producto.cantidad || !producto.precioProducto || !producto.nombreProducto) {
                throw new Error("Todos los campos de producto son requeridos");
            }
            return {
                idProducto: producto.idProducto,
                cantidad: producto.cantidad,
                precioProducto: producto.precioProducto,
                nombreProducto: producto.nombreProducto
            }
        })

        factura.total = factura.productos.reduce((total, producto) => total + producto.precioProducto * producto.cantidad, 0);

        await factura.save();

        for (let producto of factura.productos) {
            let productoDB = await Producto.findById(producto.idProducto);
            if (productoDB) {
                productoDB.stock -= producto.cantidad; 
                productoDB.vendidos += producto.cantidad; 
                await productoDB.save();
            }
        }

        const facturaConUsuario = await Factura.findById(factura._id).populate('idUsuario', 'name surname email');
        const pdfPath = await generarFacturaPDF(facturaConUsuario);

        return res.status(200).json({
            success: true,
            message: "Factura actualizada exitosamente",
            factura,
            pdfUrl: pdfPath 
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al editar la factura",
            error: err.message
        });
    }
}

export const anularFactura = async (req, res) => {
    try {
        const { idFactura } = req.params;
        const { motivo } = req.body;
        const { usuario } = req;

        const factura = await Factura.findById(idFactura);
        
        if (!factura) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        if (usuario.role !== "ADMIN_ROLE" && factura.idUsuario.toString() !== usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para anular esta factura"
            });
        }

        if (factura.estado === "ANULADA") {
            return res.status(400).json({
                success: false,
                message: "La factura ya está anulada"
            });
        }

        for (let producto of factura.productos) {
            const productoDB = await Producto.findById(producto.idProducto);
            if (productoDB) {
                productoDB.stock += producto.cantidad;
                productoDB.vendidos -= producto.cantidad;
                await productoDB.save();
            }
        }

        factura.estado = "ANULADA";
        factura.fechaAnulacion = new Date();
        factura.motivoAnulacion = motivo || "Sin motivo especificado";
        await factura.save();

        return res.status(200).json({
            success: true,
            message: "Factura anulada exitosamente",
            factura: {
                id: factura._id,
                estado: factura.estado,
                fechaAnulacion: factura.fechaAnulacion,
                motivoAnulacion: factura.motivoAnulacion,
                total: factura.total
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al anular la factura",
            error: err.message
        });
    }
}

export const obtenerFacturasPorUsuario = async (req, res) => {
    try {
        const { usuario } = req; 
        const { estado } = req.query;  
        let facturas;

        let filtroEstado = {};
        if (estado && ["ACTIVA", "ANULADA"].includes(estado.toUpperCase())) {
            filtroEstado.estado = estado.toUpperCase();
        }

        if (usuario.role === "ADMIN_ROLE") {
            const { idUsuario } = req.query;
            
            if (idUsuario) {
                facturas = await Factura.find({ idUsuario, ...filtroEstado })
                    .populate("productos.idProducto")
                    .populate("idUsuario", "name surname email");
            } else {
                facturas = await Factura.find({ ...filtroEstado })
                    .populate("productos.idProducto")
                    .populate("idUsuario", "name surname email");
            }
        } else {
            facturas = await Factura.find({ idUsuario: usuario._id, ...filtroEstado })
                .populate("productos.idProducto")
                .populate("idUsuario", "name surname email");
        }

        if (!facturas || facturas.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron facturas"
            });
        }

        return res.status(200).json({
            success: true,
            facturas
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener las facturas",
            error: err.message
        });
    }
}

export const obtenerFactura = async (req, res) => {
    try {
        const { idFactura } = req.params;
        const { usuario } = req;

        const factura = await Factura.findById(idFactura)
            .populate("productos.idProducto")
            .populate("idUsuario", "name surname email");

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        if (usuario.role !== "ADMIN_ROLE" && factura.idUsuario._id.toString() !== usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para ver esta factura"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Factura obtenida exitosamente",
            factura
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener la factura",
            error: err.message
        });
    }
}

export const descargarFacturaPDF = async (req, res) => {
    try {
        const { idFactura } = req.params;
        const { usuario } = req;

        const factura = await Factura.findById(idFactura)
            .populate("idUsuario", "name surname email");

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        if (usuario.role !== "ADMIN_ROLE" && factura.idUsuario._id.toString() !== usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para descargar esta factura"
            });
        }

        const pdfBuffer = await generarFacturaPDF(factura);

        const fileName = `Factura_${factura._id.toString().slice(-8).toUpperCase()}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.status(200).end(pdfBuffer);

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al descargar la factura",
            error: err.message
        });
    }
}

const generarFacturaPDF = async (factura) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margins: { top: 50, left: 50, right: 50, bottom: 50 },
                size: 'A4'
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.fillColor('#2c3e50')
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('GESTOR DE INVENTARIO FC COMEBACKS', 50, 50, { align: 'center' });

            doc.moveTo(50, 85)
               .lineTo(545, 85)
               .strokeColor('#3498db')
               .lineWidth(3)
               .stroke();

            doc.fillColor('#34495e')
               .fontSize(12)
               .font('Helvetica')
               .text('Sistema de Gestión de Inventario Profesional', 50, 100, { align: 'center' })
               .text('NIT: 123456789-0 | Tel: +502 1234-5678', 50, 115, { align: 'center' })
               .text('www.fccombacks.com | info@fccomebacks.com', 50, 130, { align: 'center' });

            const facturaY = 170;
            doc.fillColor('#e74c3c')
               .fontSize(18)
               .font('Helvetica-Bold')
               .text('FACTURA', 400, facturaY);

            doc.fillColor('#2c3e50')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('No. Factura:', 400, facturaY + 25)
               .font('Helvetica')
               .text(`${factura._id.toString().slice(-8).toUpperCase()}`, 400, facturaY + 40);

            doc.font('Helvetica-Bold')
               .text('Fecha:', 400, facturaY + 60)
               .font('Helvetica')
               .text(new Date(factura.fecha).toLocaleDateString('es-GT', {
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric'
               }), 400, facturaY + 75);

            doc.font('Helvetica-Bold')
               .text('Estado:', 400, facturaY + 95)
               .fillColor(factura.estado === 'ACTIVA' ? '#27ae60' : '#e74c3c')
               .font('Helvetica-Bold')
               .text(factura.estado, 400, facturaY + 110);

            doc.fillColor('#2c3e50')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('DATOS DEL CLIENTE', 50, facturaY);

            const nombreCompleto = factura.idUsuario ? 
                `${factura.idUsuario.name} ${factura.idUsuario.surname}` : 
                'Cliente no disponible';

            doc.fontSize(11)
               .font('Helvetica-Bold')
               .text('Cliente:', 50, facturaY + 25)
               .font('Helvetica')
               .text(nombreCompleto, 50, facturaY + 40);
            
            if (factura.idUsuario && factura.idUsuario.email) {
                doc.font('Helvetica-Bold')
                   .text('Email:', 50, facturaY + 60)
                   .font('Helvetica')
                   .text(factura.idUsuario.email, 50, facturaY + 75);
            }

            doc.font('Helvetica-Bold')
               .text('ID Cliente:', 50, facturaY + 95)
               .font('Helvetica')
               .text(factura.idUsuario ? factura.idUsuario._id.toString().slice(-6).toUpperCase() : 'N/A', 50, facturaY + 110);

            const lineY = facturaY + 140;
            doc.moveTo(50, lineY)
               .lineTo(545, lineY)
               .strokeColor('#bdc3c7')
               .lineWidth(1)
               .stroke();

            const tableStartY = lineY + 20;
            doc.fillColor('#ecf0f1')
               .rect(50, tableStartY, 495, 25)
               .fill();

            doc.fillColor('#2c3e50')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('PRODUCTO', 60, tableStartY + 8)
               .text('PRECIO UNIT.', 280, tableStartY + 8)
               .text('CANT.', 380, tableStartY + 8)
               .text('SUBTOTAL', 450, tableStartY + 8);

            let currentY = tableStartY + 25;
            let subtotalGeneral = 0;

            factura.productos.forEach((producto, index) => {
                const subtotal = producto.precioProducto * producto.cantidad;
                subtotalGeneral += subtotal;

                if (index % 2 === 0) {
                    doc.fillColor('#f8f9fa')
                       .rect(50, currentY, 495, 20)
                       .fill();
                }

                doc.fillColor('#2c3e50')
                   .fontSize(10)
                   .font('Helvetica')
                   .text(producto.nombreProducto.slice(0, 30), 60, currentY + 5)
                   .text(`Q${producto.precioProducto.toFixed(2)}`, 280, currentY + 5)
                   .text(producto.cantidad.toString(), 390, currentY + 5)
                   .text(`Q${subtotal.toFixed(2)}`, 450, currentY + 5);

                currentY += 20;
            });

            doc.moveTo(50, currentY)
               .lineTo(545, currentY)
               .strokeColor('#bdc3c7')
               .lineWidth(1)
               .stroke();

            const totalsY = currentY + 20;
            
            doc.fillColor('#2c3e50')
               .fontSize(11)
               .font('Helvetica')
               .text('Subtotal:', 380, totalsY)
               .text(`Q${subtotalGeneral.toFixed(2)}`, 450, totalsY);

            const iva = subtotalGeneral * 0.12;
            doc.text('IVA (12%):', 380, totalsY + 20)
               .text(`Q${iva.toFixed(2)}`, 450, totalsY + 20);

            doc.fillColor('#e74c3c')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('TOTAL:', 380, totalsY + 45)
               .text(`Q${factura.total.toFixed(2)}`, 450, totalsY + 45);

            doc.rect(375, totalsY + 40, 170, 25)
               .strokeColor('#e74c3c')
               .lineWidth(2)
               .stroke();

            const footerY = totalsY + 100;
            
            doc.fillColor('#2c3e50')
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('INFORMACIÓN ADICIONAL:', 50, footerY);

            doc.font('Helvetica')
               .text(`• Total de productos: ${factura.productos.length}`, 50, footerY + 20)
               .text(`• Método de pago: Efectivo/Tarjeta`, 50, footerY + 35)
               .text(`• Garantía: 30 días en productos electrónicos`, 50, footerY + 50);

            if (factura.estado === 'ANULADA') {
                doc.fillColor('#e74c3c')
                   .fontSize(16)
                   .font('Helvetica-Bold')
                   .text('*** FACTURA ANULADA ***', 50, footerY + 80, { align: 'center' });
                
                if (factura.motivoAnulacion) {
                    doc.fontSize(10)
                       .font('Helvetica')
                       .text(`Motivo: ${factura.motivoAnulacion}`, 50, footerY + 105, { align: 'center' });
                }
            }

            const pageHeight = doc.page.height;
            doc.fillColor('#7f8c8d')
               .fontSize(9)
               .font('Helvetica')
               .text('Gracias por su compra. Esta factura es generada electrónicamente.', 50, pageHeight - 80, { align: 'center' })
               .text('Para soporte técnico contacte: soporte@fccombacks.com', 50, pageHeight - 65, { align: 'center' })
               .text(`Factura generada el ${new Date().toLocaleString('es-GT')}`, 50, pageHeight - 50, { align: 'center' });

            doc.moveTo(50, pageHeight - 35)
               .lineTo(545, pageHeight - 35)
               .strokeColor('#bdc3c7')
               .lineWidth(1)
               .stroke();

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

