import { create } from 'xmlbuilder2';

export class XmlGenerator {
  /**
   * Genera XML de factura electrónica según formato SIN
   */
  static generate(invoiceData: {
    cuf: string;
    cufd: string;
    numeroFactura: string;
    fecha: string;
    nit: string;
    razonSocial: string;
    cliente: {
      nombre: string;
      nit: string;
      complemento?: string;
    };
    items: Array<{
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
    subtotal: number;
    descuento: number;
    total: number;
  }): string {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('facturaElectronicaCompraVenta', {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:noNamespaceSchemaLocation': 'facturaElectronicaCompraVenta.xsd',
      })
      .ele('cabecera')
        .ele('cuf').txt(invoiceData.cuf).up()
        .ele('cufd').txt(invoiceData.cufd).up()
        .ele('numeroFactura').txt(invoiceData.numeroFactura).up()
        .ele('fechaEmision').txt(invoiceData.fecha).up()
        .ele('emisor')
          .ele('nit').txt(invoiceData.nit).up()
          .ele('razonSocial').txt(invoiceData.razonSocial).up()
        .up()
        .ele('cliente')
          .ele('nombreRazonSocial').txt(invoiceData.cliente.nombre).up()
          .ele('numeroDocumento').txt(invoiceData.cliente.nit).up();

    if (invoiceData.cliente.complemento) {
      doc.ele('complemento').txt(invoiceData.cliente.complemento).up();
    }

    doc.up().up(); // Cerrar cliente y cabecera

    // Detalle de items
    const detalle = doc.ele('detalle');
    
    invoiceData.items.forEach((item, index) => {
      detalle
        .ele('item')
          .ele('numeroItem').txt((index + 1).toString()).up()
          .ele('descripcion').txt(item.descripcion).up()
          .ele('cantidad').txt(item.cantidad.toString()).up()
          .ele('precioUnitario').txt(item.precioUnitario.toFixed(2)).up()
          .ele('montoTotal').txt(item.subtotal.toFixed(2)).up()
        .up();
    });

    detalle.up(); // Cerrar detalle

    // Totales
    doc
      .ele('montos')
        .ele('montoTotal').txt(invoiceData.subtotal.toFixed(2)).up()
        .ele('montoDescuento').txt(invoiceData.descuento.toFixed(2)).up()
        .ele('montoTotalSujetoIva').txt(invoiceData.total.toFixed(2)).up()
      .up();

    return doc.end({ prettyPrint: true });
  }
}
