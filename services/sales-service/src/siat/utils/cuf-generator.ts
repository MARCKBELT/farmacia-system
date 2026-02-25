import * as crypto from 'crypto';

export class CufGenerator {
  /**
   * Genera el CUF (Código Único de Factura) según especificaciones del SIN
   * 
   * Formato CUF (44 dígitos):
   * - NIT (13 dígitos)
   * - Fecha/Hora emisión (17 dígitos: YYYYMMDDHHmmssSSS)
   * - Sucursal (4 dígitos)
   * - Modalidad (1 dígito: 1=Electrónica, 2=Computarizada)
   * - Tipo emisión (1 dígito: 1=Online, 2=Offline)
   * - Código de control (8 dígitos)
   */
  static generate(
    nit: string,
    sucursal: number,
    modalidad: number,
    tipoEmision: number,
  ): string {
    // 1. NIT (13 dígitos, rellenar con ceros a la izquierda)
    const nitPadded = nit.padStart(13, '0');

    // 2. Fecha/Hora emisión (17 dígitos: YYYYMMDDHHmmssSSS)
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    
    const fechaHora = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;

    // 3. Sucursal (4 dígitos)
    const sucursalPadded = sucursal.toString().padStart(4, '0');

    // 4. Modalidad (1 dígito)
    const modalidadStr = modalidad.toString();

    // 5. Tipo emisión (1 dígito)
    const tipoEmisionStr = tipoEmision.toString();

    // 6. Código de control (8 dígitos) - Generado con algoritmo módulo 11
    const baseCuf = `${nitPadded}${fechaHora}${sucursalPadded}${modalidadStr}${tipoEmisionStr}`;
    const codigoControl = this.generateCodigoControl(baseCuf);

    // CUF completo (44 dígitos)
    return `${baseCuf}${codigoControl}`;
  }

  /**
   * Genera el código de control usando algoritmo módulo 11
   */
  private static generateCodigoControl(base: string): string {
    let sum = 0;
    let multiplier = 2;

    // Sumar dígitos multiplicados por factor creciente
    for (let i = base.length - 1; i >= 0; i--) {
      sum += parseInt(base[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    // Calcular módulo 11
    const modulo = sum % 11;
    const digitoVerificador = modulo === 0 ? 0 : modulo === 1 ? 1 : 11 - modulo;

    // Generar 8 dígitos (6 aleatorios + 2 de verificación)
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const checksum = digitoVerificador.toString().padStart(2, '0');

    return `${random}${checksum}`;
  }

  /**
   * Valida formato de CUF
   */
  static validate(cuf: string): boolean {
    return /^\d{44}$/.test(cuf);
  }
}
