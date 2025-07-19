import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStatistics() {
    // از Promise.all برای اجرای تمام کوئری‌های شمارش به صورت موازی استفاده می‌کنیم
    // این کار سرعت را به شدت بالا می‌برد
    const [
      totalAccounts,
      totalAuthTokens,
      activeAuthTokens,
      totalGroups,
      totalChats,
      totalLogins,
    ] = await Promise.all([
      // ۲. تعداد کل اکانت‌های OpenAI
      this.prisma.openAiAccount.count(),

      // ۳. تعداد کل توکن‌های دستوری ساخته شده
      this.prisma.authToken.count(),

      // ۳.۱. تعداد توکن‌های دستوری فعال
      this.prisma.authToken.count({ where: { isActive: true } }),
      
      // ۴. تعداد کل گروه‌های ساخته شده توسط کاربران
      this.prisma.group.count(),

      // ۵. تعداد کل چت‌های ذخیره شده
      this.prisma.chat.count(),

      // ۶. تعداد کل لاگین‌های صورت گرفته
      this.prisma.authToken.aggregate({
        _sum: {
          usageCount: true, // ستون usageCount را جمع می‌زنیم
        },
      }),
    ]);

    // آماده‌سازی پاسخ نهایی
    return {
      accounts: {
        total: totalAccounts,
      },
      authTokens: {
        total: totalAuthTokens,
        active: activeAuthTokens,
        inactive: totalAuthTokens - activeAuthTokens,
      },
      groups: {
        total: totalGroups,
      },
      chats: {
        total: totalChats,
      },
      logins: {
        total: totalLogins._sum.usageCount || 0,
      },
    };
  }
}
