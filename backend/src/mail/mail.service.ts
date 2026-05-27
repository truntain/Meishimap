import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true for port 465, false for other ports like 587
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendApprovalEmail(to: string, ownerName: string, tempPassword: string): Promise<boolean> {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'MESHIMAP';
    const fromUser = this.configService.get<string>('SMTP_USER');

    const mailOptions = {
      from: `"${fromName}" <${fromUser}>`,
      to,
      subject: '[MESHIMAP] Đăng ký đối tác thành công / パートナー登録完了のお知らせ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #6C2F00; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 0.1em;">MESHIMAP</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #FAF6F0;">
            <p>Xin chào <strong>${ownerName}</strong>,</p>
            <p>Chúc mừng! Đơn đăng ký hợp tác mở nhà hàng của bạn trên hệ thống <strong>MESHIMAP</strong> đã được phê duyệt thành công.</p>
            <p>Dưới đây là thông tin tài khoản đăng nhập của bạn để quản lý nhà hàng:</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e2d8cf; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 120px;">Email / ID:</td>
                  <td style="padding: 6px 0; color: #6C2F00; font-weight: bold;">${to}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Mật khẩu / PW:</td>
                  <td style="padding: 6px 0; font-family: monospace; font-size: 16px; color: #FD8A3E; font-weight: bold;">${tempPassword}</td>
                </tr>
              </table>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login" style="background-color: #6C2F00; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đăng nhập quản lý / ログイン</a>
            </p>

            <hr style="border: 0; border-top: 1px solid #e2d8cf; margin: 30px 0;" />
            
            <p style="font-size: 14px; color: #666; font-style: italic;">
              <strong>[日本語]</strong><br>
              ${ownerName} 様,<br>
              おめでとうございます！MESHIMAPへのパートナーレストラン登録申請が承認されました。<br>
              上記のアカウント情報を使用してログインし、店舗情報の管理やメニューの設定を行ってください。
            </p>
            
            <p style="font-size: 12px; color: #877369; text-align: center; margin-top: 40px;">
              Đây là email tự động, vui lòng không phản hồi thư này.<br>
              © 2026 MESHIMAP Team. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Approval email successfully sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send approval email to ${to}:`, error);
      return false;
    }
  }
}
