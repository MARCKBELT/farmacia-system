import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class HttpService {
  constructor(private configService: ConfigService) {}

  async getProduct(productId: number) {
    try {
      const url = this.configService.get('PRODUCTS_SERVICE_URL');
      const response = await axios.get(`${url}/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new HttpException('Error al obtener producto', 500);
    }
  }

  async getStockByProduct(productId: number) {
    try {
      const url = this.configService.get('INVENTORY_SERVICE_URL');
      const response = await axios.get(`${url}/stock/product/${productId}/total`);
      return response.data;
    } catch (error) {
      throw new HttpException('Error al obtener stock', 500);
    }
  }

  async adjustStock(stockId: number, quantity: number, reason: string, userId?: string, userName?: string) {
    try {
      const url = this.configService.get('INVENTORY_SERVICE_URL');
      const response = await axios.post(`${url}/stock/${stockId}/adjust`, {
        quantity,
        type: 'AJUSTE_NEGATIVO',
        reason,
        userId,
        userName,
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Error al ajustar stock', 500);
    }
  }
}
