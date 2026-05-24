'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import AdminHeader from './components/AdminHeader';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminStatsPage() {
  const [totalRestaurants, setTotalRestaurants] = useState(12);

  useEffect(() => {
    // Dynamic update logic from localStorage
    const stored = localStorage.getItem('meshimap_pending_restaurants');
    if (stored) {
      const data = JSON.parse(stored);
      const approved = data.filter((r: any) => r.status === 'approved').length;
      // Start with base 12 and add newly approved
      setTotalRestaurants(12 + approved);
    }
  }, []);

  const revenueData = {
    labels: ['Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
    datasets: [
      {
        label: 'Doanh thu hệ thống (triệu VNĐ)',
        data: [12.4, 15.8, 14.2, 19.5, 22.1, 25.4],
        borderColor: '#FD8A3E',
        backgroundColor: 'rgba(253, 138, 62, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#6C2F00',
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(218,194,182,0.15)' },
        ticks: { color: '#54433A', font: { family: 'Be Vietnam Pro' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#54433A', font: { family: 'Be Vietnam Pro' } },
      },
    },
  };

  const userData = {
    labels: ['Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
    datasets: [
      {
        label: 'Đăng ký mới',
        data: [42, 65, 58, 89, 72, 98],
        backgroundColor: '#6C2F00',
        hoverBackgroundColor: '#FD8A3E',
        borderRadius: 6,
      },
    ],
  };

  const userOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(218,194,182,0.15)' },
        ticks: { color: '#54433A', font: { family: 'Be Vietnam Pro' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#54433A', font: { family: 'Be Vietnam Pro' } },
      },
    },
  };

  return (
    <>
      <AdminHeader title="Thống kê & Tổng quan" />
      <div className="db-content">
        <div className="db-stats-grid">
          <div className="db-stat-card">
            <div className="db-stat-card__info">
              <span className="db-stat-card__label">Tổng số nhà hàng</span>
              <span className="db-stat-card__value">{totalRestaurants}</span>
              <span className="db-stat-card__trend db-stat-card__trend--up">▲ +12% tháng này</span>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-card__info">
              <span className="db-stat-card__label">Số lượng thành viên</span>
              <span className="db-stat-card__value">352</span>
              <span className="db-stat-card__trend db-stat-card__trend--up">▲ +24% tháng này</span>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-card__info">
              <span className="db-stat-card__label">Lượt đặt bàn thành công</span>
              <span className="db-stat-card__value">1,428</span>
              <span className="db-stat-card__trend db-stat-card__trend--up">▲ +18% tháng này</span>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-card__info">
              <span className="db-stat-card__label">Doanh thu hệ thống</span>
              <span className="db-stat-card__value">25,4M VNĐ</span>
              <span className="db-stat-card__trend db-stat-card__trend--up">▲ +15% tháng này</span>
            </div>
          </div>
        </div>

        <div className="db-charts-grid">
          <div className="db-card">
            <h3 className="db-card__title" style={{ marginBottom: 20 }}>
              Doanh thu hệ thống (Hàng tháng)
            </h3>
            <div style={{ position: 'relative', height: 300, width: '100%' }}>
              <Line data={revenueData} options={revenueOptions} />
            </div>
          </div>
          <div className="db-card">
            <h3 className="db-card__title" style={{ marginBottom: 20 }}>
              Tăng trưởng người dùng mới
            </h3>
            <div style={{ position: 'relative', height: 300, width: '100%' }}>
              <Bar data={userData} options={userOptions} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
