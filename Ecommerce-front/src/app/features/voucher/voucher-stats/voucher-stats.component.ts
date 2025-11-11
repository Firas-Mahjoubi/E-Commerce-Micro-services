import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface VoucherStats {
  totalVouchers: number;
  activeVouchers: number;
  inactiveVouchers: number;
  expiredVouchers: number;
  scheduledVouchers: number;
}

@Component({
  selector: 'app-voucher-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voucher-stats.component.html',
  styleUrl: './voucher-stats.component.css'
})
export class VoucherStatsComponent implements OnInit {
  private http = inject(HttpClient);

  stats: VoucherStats | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = '';

    this.http.get<VoucherStats>('http://localhost:8090/api/voucher/statistics')
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load statistics';
          this.loading = false;
          console.error('Error loading stats:', err);
        }
      });
  }

  getActivePercentage(): number {
    if (!this.stats || this.stats.totalVouchers === 0) return 0;
    return Math.round((this.stats.activeVouchers / this.stats.totalVouchers) * 100);
  }

  getInactivePercentage(): number {
    if (!this.stats || this.stats.totalVouchers === 0) return 0;
    return Math.round((this.stats.inactiveVouchers / this.stats.totalVouchers) * 100);
  }

  getExpiredPercentage(): number {
    if (!this.stats || this.stats.totalVouchers === 0) return 0;
    return Math.round((this.stats.expiredVouchers / this.stats.totalVouchers) * 100);
  }
}
