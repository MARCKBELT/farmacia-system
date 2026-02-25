import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CufGenerator } from './utils/cuf-generator';
import { CufdGenerator } from './utils/cufd-generator';
import { QrGenerator } from './utils/qr-generator';
import { XmlGenerator } from './utils/xml-generator';
import { format } from 'date-fns';

@Injectable()
export class SiatService {
  // Datos de la farmacia (en producción, estos vendrían de configuración)
  private readonly FARMACIA_NIT = '1234567890';
  private readonly FARMACIA_RAZON_SOCIAL = 'Farmacia Salud Total';
  private readonly SUCURSAL = 0;
  private readonly MODALIDAD = 2; // 2=Computarizada
  private readonly TIPO_EMISION = 1; // 1=Online

  constructor(private prisma: PrismaService) {}

  /**
   * Genera factura electrónica para una venta
   */
  async generateInvoice(saleId: number) {
    // Obtener venta con items
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    // Verificar si ya tiene factura
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { saleId },
    });

    if (existingInvoice) {
      return {
        message: 'Esta venta ya tiene factura',
        invoice: existingInvoice,
      };
    }

    // Generar CUF
    const cuf = CufGenerator.generate(
      this.FARMACIA_NIT,
      this.SUCURSAL,
      this.MODALIDAD,
      this.TIPO_EMISION,
    );

    // Generar CUFD
    const cufd = CufdGenerator.generate(this.FARMACIA_NIT);

    // Generar número de factura
    const numeroFactura = await this.generateInvoiceNumber();

    // Generar código de autorización
    const authorizationCode = this.generateAuthorizationCode();

    // Preparar datos para XML y QR
    const fecha = format(new Date(sale.createdAt), 'yyyy-MM-dd HH:mm:ss');

    const invoiceData = {
      cuf,
      cufd,
      numeroFactura,
      fecha,
      nit: this.FARMACIA_NIT,
      razonSocial: this.FARMACIA_RAZON_SOCIAL,
      cliente: {
        nombre: sale.customerName || 'Cliente General',
        nit: sale.customerNit || '0',
      },
      items: sale.items.map(item => ({
        descripcion: item.productName,
        cantidad: item.quantity,
        precioUnitario: parseFloat(item.unitPrice.toString()),
        subtotal: parseFloat(item.total.toString()),
      })),
      subtotal: parseFloat(sale.subtotal.toString()),
      descuento: parseFloat(sale.discount.toString()),
      total: parseFloat(sale.total.toString()),
    };

    // Generar XML
    const xml = XmlGenerator.generate(invoiceData);

    // Generar código QR
    const qrCode = await QrGenerator.generate({
      nit: this.FARMACIA_NIT,
      numeroFactura,
      numeroAutorizacion: authorizationCode,
      fecha: format(new Date(sale.createdAt), 'yyyy-MM-dd'),
      total: parseFloat(sale.total.toString()),
      cuf,
    });

    // Guardar factura en base de datos
    const invoice = await this.prisma.invoice.create({
      data: {
        saleId,
        invoiceNumber: numeroFactura,
        authorizationCode,
        cuf,
        customerName: sale.customerName || 'Cliente General',
        customerNit: sale.customerNit || '0',
        total: sale.total,
        qrCode,
        isElectronic: true,
      },
    });

    return {
      success: true,
      invoice,
      xml,
      qrCode,
      message: 'Factura generada exitosamente',
    };
  }

  /**
   * Obtiene factura por ID de venta
   */
  async getInvoiceBySale(saleId: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { saleId },
      include: {
        sale: {
          include: {
            items: true,
            customer: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Factura no encontrada para esta venta');
    }

    return invoice;
  }

  /**
   * Genera número de factura secuencial
   */
  private async generateInvoiceNumber(): Promise<string> {
    const lastInvoice = await this.prisma.invoice.findFirst({
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber);
      sequence = lastNumber + 1;
    }

    return sequence.toString().padStart(10, '0');
  }

  /**
   * Genera código de autorización
   */
  private generateAuthorizationCode(): string {
    const timestamp = Date.now().toString();
    return timestamp.substring(timestamp.length - 15);
  }
}
