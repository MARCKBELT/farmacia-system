import * as QRCode from 'qrcode';

export class QrGenerator {
  /**
   * Genera código QR para factura electrónica
   * Contiene información para verificación en el portal del SIN
   */
  static async generate(invoiceData: {
    nit: string;
    numeroFactura: string;
    numeroAutorizacion: string;
    fecha: string;
    total: number;
    cuf: string;
  }): Promise<string> {
    // Formato de datos para QR según especificación SIN
    const qrData = [
      invoiceData.nit,
      invoiceData.numeroFactura,
      invoiceData.numeroAutorizacion,
      invoiceData.fecha,
      invoiceData.total.toFixed(2),
      invoiceData.cuf,
    ].join('|');

    // Generar QR en formato base64
    try {
      const qrBase64 = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 250,
        margin: 1,
      });

      return qrBase64;
    } catch (error) {
      throw new Error('Error al generar código QR');
    }
  }

  /**
   * Genera QR como buffer de imagen
   */
  static async generateBuffer(invoiceData: {
    nit: string;
    numeroFactura: string;
    numeroAutorizacion: string;
    fecha: string;
    total: number;
    cuf: string;
  }): Promise<Buffer> {
    const qrData = [
      invoiceData.nit,
      invoiceData.numeroFactura,
      invoiceData.numeroAutorizacion,
      invoiceData.fecha,
      invoiceData.total.toFixed(2),
      invoiceData.cuf,
    ].join('|');

    try {
      const buffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'M',
        type: 'png',
        width: 250,
        margin: 1,
      });

      return buffer;
    } catch (error) {
      throw new Error('Error al generar código QR');
    }
  }
}
