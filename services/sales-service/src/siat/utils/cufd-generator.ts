import * as crypto from 'crypto';

export class CufdGenerator {
  /**
   * Genera el CUFD (Código Único de Factura Diaria)
   * Se renueva cada día a las 00:00
   * 
   * En producción, este código se obtiene del servicio del SIN
   * Aquí lo generamos para desarrollo/testing
   */
  static generate(nit: string): string {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // Generar hash único para el día
    const hash = crypto
      .createHash('sha256')
      .update(`${nit}-${dateStr}`)
      .digest('hex')
      .substring(0, 32)
      .toUpperCase();

    return hash;
  }

  /**
   * Verifica si un CUFD es válido para la fecha actual
   */
  static isValid(cufd: string, generatedDate: Date): boolean {
    const today = new Date();
    const isSameDay =
      generatedDate.getDate() === today.getDate() &&
      generatedDate.getMonth() === today.getMonth() &&
      generatedDate.getFullYear() === today.getFullYear();

    return isSameDay && /^[A-Z0-9]{32}$/.test(cufd);
  }
}
