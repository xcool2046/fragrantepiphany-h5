import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string) {
    const envUser = process.env.ADMIN_USER
    const envPass = process.env.ADMIN_PASS
    if (!envUser || !envPass) throw new UnauthorizedException('Admin not configured')
    if (username !== envUser) return null
    const ok = await this.compare(password, envPass)
    if (!ok) return null
    return { username }
  }

  async login(user: { username: string }) {
    const payload = { sub: user.username }
    return { access_token: await this.jwtService.signAsync(payload) }
  }

  private async compare(password: string, plain: string) {
    // allow plain-text password in env (monicacjx...), or hashed starting with $2
    if (plain.startsWith('$2')) {
      return bcrypt.compare(password, plain)
    }
    return password === plain
  }
}
