import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        fullName: registerDto.fullName,
        role: registerDto.role,
      },
    });

    await this.createDefaultPermissions(user.id, registerDto.role);
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { permissions: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
      },
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    };
  }

  private async createDefaultPermissions(userId: string, role: string) {
    const modules = ['ventas', 'inventario', 'productos', 'clientes', 'reportes', 'configuracion'];
    
    const permissionsData = modules.map(module => ({
      userId,
      module,
      ...this.getPermissionsByRole(role, module),
    }));

    await this.prisma.permission.createMany({
      data: permissionsData,
    });
  }

  private getPermissionsByRole(role: string, module: string) {
    switch (role) {
      case 'ADMIN':
        return { canCreate: true, canRead: true, canUpdate: true, canDelete: true };
      case 'GERENTE':
        return { canCreate: true, canRead: true, canUpdate: true, canDelete: module !== 'configuracion' };
      case 'VENDEDOR':
        return {
          canCreate: module === 'ventas',
          canRead: ['ventas', 'productos', 'clientes'].includes(module),
          canUpdate: module === 'ventas',
          canDelete: false,
        };
      case 'CAJERO':
        return {
          canCreate: module === 'ventas',
          canRead: module === 'ventas',
          canUpdate: false,
          canDelete: false,
        };
      default:
        return { canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    }
  }
}