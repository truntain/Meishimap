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
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          Cookies.remove('access_token');
          Cookies.remove('user');
          window.location.href = '/login';
          return;
        }

        if (!res.ok) {
          throw new Error(t('admin.stats.errorLoad'));
        }

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t('admin.stats.errorConnect'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  const chartLabels = (stats?.charts?.labels || ['Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5']).map(
    (lbl: string) => t(`admin.stats.months.${lbl}`, lbl)
  );

  const restaurantData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('admin.stats.chartResLabel'),
        data: stats?.charts?.restaurantRegistrations || [1, 2, 1, 3, 2, 4],
        borderColor: '#FD8A3E',
        backgroundColor: 'rgba(253, 138, 62, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#6C2F00',
      },
    ],
  };

  const restaurantOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(218,194,182,0.15)' },
        ticks: { color: '#54433A', font: { family: 'Be Vietnam Pro' }, stepSize: 1 },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#54433A', font: { family: 'Be Vietnam Pro' } },
      },
    },
  };

  const userData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('admin.stats.chartUserLabel'),
        data: stats?.charts?.userRegistrations || [42, 65, 58, 89, 72, 98],
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
      <AdminHeader title={t('admin.stats.title')} />
      <div className="db-content">
        {loading && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--clr-muted)' }}>
            {t('admin.stats.loading')}
          </div>
        )}
        {error && (
          <div className="db-alert db-alert--warning" style={{ marginBottom: 20 }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="db-stat-card">
            <div className="db-stat-card__info">
              <span className="db-stat-card__label">{t('admin.stats.totalRes')}</span>
              <span className="db-stat-card__value">{stats?.summary?.totalRestaurants ?? '...'}</span>
              <span className="db-stat-card__trend db-stat-card__trend--up">{t('admin.stats.trendMonth', { count: stats?.summary?.totalRestaurantsTrend ?? 100 })}</span>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-card__info">
              <span className="db-stat-card__label">{t('admin.stats.totalMembers')}</span>
              <span className="db-stat-card__value">{stats?.summary?.totalMembers ?? '...'}</span>
              <span className="db-stat-card__trend db-stat-card__trend--up">{t('admin.stats.trendMonth', { count: stats?.summary?.totalMembersTrend ?? 100 })}</span>
            </div>
          </div>
          <div className="db-stat-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="db-stat-card__info">
              <span className="db-stat-card__label">{t('admin.stats.pendingRes')}</span>
              <span className="db-stat-card__value" style={{ color: '#ef4444' }}>{stats?.summary?.pendingRestaurants ?? '...'}</span>
              <span className="db-stat-card__trend db-stat-card__trend--up" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>{t('admin.stats.newTrend')}</span>
            </div>
          </div>
        </div>

        <div className="db-charts-grid">
          <div className="db-card">
            <h3 className="db-card__title" style={{ marginBottom: 20 }}>
              {t('admin.stats.chartResTitle')}
            </h3>
            <div style={{ position: 'relative', height: 300, width: '100%' }}>
              <Line data={restaurantData} options={restaurantOptions} />
            </div>
          </div>
          <div className="db-card">
            <h3 className="db-card__title" style={{ marginBottom: 20 }}>
              {t('admin.stats.chartUserTitle')}
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
