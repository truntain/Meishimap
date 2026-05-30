'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from './components/OwnerHeader';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

const defaultRestaurant = {
  name: 'Sakura Garden',
  address: '123 Le Loi Street, District 1, Ho Chi Minh City',
  openTime: '10:00',
  closeTime: '22:00',
  jpSupport: true,
  jpSupportText: 'Tiếng Việt, Tiếng Nhật, English',
  phone: '+84 28 3823 4567',
  banner: '',
  menu: [
    { name: 'Premium Sashimi Set', price: '450.000đ', cat: 'sashimi', icon: '🐟', desc: 'A curated selection of seasonal fish including Otoro, Sake, and Hamachi.' },
    { name: 'Sashimi Deluxe', price: '380.000đ', cat: 'sashimi', icon: '🍱', desc: 'Premium cut fish with authentic wasabi and soy sauce.' },
    { name: 'Tempura Set', price: '280.000đ', cat: 'tempura', icon: '🍤', desc: 'Crispy light-battered shrimp and vegetables with dipping sauce.' },
    { name: 'Tonkotsu Ramen', price: '195.000đ', cat: 'ramen', icon: '🍜', desc: 'Rich pork bone broth simmered 18 hours, chashu pork, soft egg.' }
  ],
  reviews: [
    { author: 'Anh Nguyen', rating: 5, date: 'Tháng 5, 2024', content: 'Nhà hàng tuyệt vời! Sashimi tươi ngon, nhân viên thân thiện và hỗ trợ tiếng Nhật rất tốt. Sẽ quay lại lần sau.', replies: [], reported: false },
    { author: 'Minh Tran', rating: 4, date: 'Tháng 4, 2024', content: 'Không gian đẹp, món ăn chất lượng cao. Giá hơi cao nhưng xứng đáng với trải nghiệm đem lại.', replies: [], reported: false }
  ]
};

export default function OwnerRestaurantPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [alertMsg, setAlertMsg] = useState<{ msg: string, type: string } | null>(null);
  const { t } = useTranslation();

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [menuForm, setMenuForm] = useState({ name: '', nameJp: '', price: '', cat: 'sashimi', icon: '🍣', desc: '', descJp: '' });
  useEffect(() => {
    const fetchRestaurant = async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        const stored = localStorage.getItem('meshimap_restaurant');
        if (stored) {
          setRestaurant(JSON.parse(stored));
        } else {
          setRestaurant(defaultRestaurant);
        }
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/restaurants/my-restaurant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 404) {
          setRestaurant(defaultRestaurant);
          localStorage.setItem('meshimap_restaurant', JSON.stringify(defaultRestaurant));
          return;
        }
        if (res.status === 401) {
          Cookies.remove('access_token');
          Cookies.remove('user');
          showAlert(t('owner.restaurant.alertSessionExpired'), 'warning');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Không thể lấy thông tin nhà hàng từ backend. Status: ${res.status}. Msg: ${errText}`);
        }
        const data = await res.json();
        const mappedRes = {
          ...data,
          name: data.name,
          address: data.address,
          phone: data.phone || '',
          banner: data.imageUrl || '',
          jpSupport: data.hasJapaneseSupport,
          jpSupportText: data.languages || 'Tiếng Việt, English',
          openTime: data.hours?.monday?.split(' - ')[0] || '10:00',
          closeTime: data.hours?.monday?.split(' - ')[1] || '22:00',
          menu: data.menuItems || [],
          reviews: data.reviews || [],
        };
        setRestaurant(mappedRes);
        localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      } catch (err) {
        console.error(err);
        const stored = localStorage.getItem('meshimap_restaurant');
        if (stored) {
          setRestaurant(JSON.parse(stored));
        } else {
          setRestaurant(defaultRestaurant);
        }
      }
    };

    fetchRestaurant();
  }, [t]);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('meshimap_restaurant', JSON.stringify(restaurant));

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert(t('owner.restaurant.alertOfflineSave'));
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/restaurants/my-restaurant', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: restaurant.name,
          phone: restaurant.phone,
          address: restaurant.address,
          imageUrl: restaurant.banner,
          hasJapaneseSupport: restaurant.jpSupport,
          description: restaurant.description || ''
        })
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(t('owner.restaurant.alertSessionExpired'), 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi cập nhật nhà hàng');
      }

      const updatedData = await res.json();
      const mappedRes = {
        ...updatedData,
        name: updatedData.name,
        address: updatedData.address,
        phone: updatedData.phone || '',
        banner: updatedData.imageUrl || '',
        jpSupport: updatedData.hasJapaneseSupport,
        jpSupportText: updatedData.languages || 'Tiếng Việt, English',
        openTime: updatedData.hours?.monday?.split(' - ')[0] || '10:00',
        closeTime: updatedData.hours?.monday?.split(' - ')[1] || '22:00',
        menu: updatedData.menuItems || [],
        reviews: updatedData.reviews || [],
      };

      setRestaurant(mappedRes);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      showAlert(t('owner.restaurant.alertOnlineSave'));
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi kết nối: ${err.message || 'Không thể lưu lên hệ thống'}`, 'warning');
    }
  };

  const handleInfoChange = (field: string, value: any) => {
    setRestaurant((prev: any) => ({ ...prev, [field]: value }));
  };

  const openMenuModal = (index: number | null = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const item = restaurant.menu[index];
      setMenuForm({
        name: item.name || '',
        nameJp: item.nameJp || '',
        price: item.price || '',
        cat: item.cat || 'sashimi',
        icon: item.icon || '🍣',
        desc: item.desc || '',
        descJp: item.descJp || '',
      });
    } else {
      setMenuForm({ name: '', nameJp: '', price: '', cat: 'sashimi', icon: '🍣', desc: '', descJp: '' });
    }
    setShowMenuModal(true);
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('access_token');
    if (!token) {
      showAlert('Vui lòng đăng nhập lại.', 'warning');
      return;
    }

    const cleanPrice = parseInt(menuForm.price.replace(/[^\d]/g, '')) || 0;
    const body = {
      name: menuForm.name,
      nameJp: menuForm.nameJp,
      price: cleanPrice,
      category: menuForm.cat,
      icon: menuForm.icon,
      description: menuForm.desc,
      descriptionJp: menuForm.descJp,
    };

    try {
      let res;
      if (editingIndex !== null) {
        const itemId = restaurant.menu[editingIndex].id;
        res = await fetch(`http://localhost:3001/restaurants/my-restaurant/menu-items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`http://localhost:3001/restaurants/my-restaurant/menu-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      }

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(t('owner.restaurant.alertSessionExpired'), 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi lưu món ăn');
      }

      const updatedRestaurant = await res.json();
      const mappedRes = {
        ...updatedRestaurant,
        name: updatedRestaurant.name,
        address: updatedRestaurant.address,
        phone: updatedRestaurant.phone || '',
        banner: updatedRestaurant.imageUrl || '',
        jpSupport: updatedRestaurant.hasJapaneseSupport,
        jpSupportText: updatedRestaurant.languages || 'Tiếng Việt, English',
        openTime: updatedRestaurant.hours?.monday?.split(' - ')[0] || '10:00',
        closeTime: updatedRestaurant.hours?.monday?.split(' - ')[1] || '22:00',
        menu: updatedRestaurant.menuItems || [],
        reviews: updatedRestaurant.reviews || [],
      };

      setRestaurant(mappedRes);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      showAlert(editingIndex !== null ? t('owner.restaurant.alertMenuUpdated') : t('owner.restaurant.alertMenuAdded'));
      setShowMenuModal(false);
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message || 'Không thể cập nhật món ăn'}`, 'warning');
    }
  };

  const deleteMenuItem = async (index: number) => {
    if (!window.confirm(t('owner.restaurant.confirmDeleteMenu'))) {
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert('Vui lòng đăng nhập lại.', 'warning');
      return;
    }

    const itemId = restaurant.menu[index].id;
    if (!itemId) {
      const updated = { ...restaurant };
      updated.menu.splice(index, 1);
      setRestaurant(updated);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(updated));
      showAlert(t('owner.restaurant.alertMenuDeleted'), 'warning');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/restaurants/my-restaurant/menu-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user');
        showAlert(t('owner.restaurant.alertSessionExpired'), 'warning');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi xóa món ăn');
      }

      const updatedRestaurant = await res.json();
      const mappedRes = {
        ...updatedRestaurant,
        name: updatedRestaurant.name,
        address: updatedRestaurant.address,
        phone: updatedRestaurant.phone || '',
        banner: updatedRestaurant.imageUrl || '',
        jpSupport: updatedRestaurant.hasJapaneseSupport,
        jpSupportText: updatedRestaurant.languages || 'Tiếng Việt, English',
        openTime: updatedRestaurant.hours?.monday?.split(' - ')[0] || '10:00',
        closeTime: updatedRestaurant.hours?.monday?.split(' - ')[1] || '22:00',
        menu: updatedRestaurant.menuItems || [],
        reviews: updatedRestaurant.reviews || [],
      };

      setRestaurant(mappedRes);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(mappedRes));
      showAlert(t('owner.restaurant.alertMenuDeleted'), 'warning');
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message || 'Không thể xóa món ăn'}`, 'warning');
    }
  };

  if (!restaurant) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <>
      <OwnerHeader title={t('owner.restaurant.headerTitle')} />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        {/* General Info Card */}
        <div className="db-card">
          <h2 className="db-card__title">{t('owner.restaurant.cardGeneralInfo')}</h2>
          <form onSubmit={handleInfoSubmit}>
            <div className="db-form-row">
              <div className="db-form-field">
                <label>{t('owner.restaurant.labelResName')} <span>/ 店名</span></label>
                <input type="text" className="db-input" required
                  value={restaurant.name || ''}
                  onChange={(e) => handleInfoChange('name', e.target.value)}
                />
              </div>
              <div className="db-form-field">
                <label>{t('owner.restaurant.labelPhone')} <span>/ 電話番号</span></label>
                <input type="text" className="db-input" required
                  value={restaurant.phone || ''}
                  onChange={(e) => handleInfoChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field" style={{ gridColumn: 'span 2' }}>
                <label>{t('owner.restaurant.labelAddress')} <span>/ 住所</span></label>
                <input type="text" className="db-input" required
                  value={restaurant.address || ''}
                  onChange={(e) => handleInfoChange('address', e.target.value)}
                />
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field">
                <label>{t('owner.restaurant.labelOpenTime')} <span>/ 開店時間</span></label>
                <input type="time" className="db-input" required
                  value={restaurant.openTime || ''}
                  onChange={(e) => handleInfoChange('openTime', e.target.value)}
                />
              </div>
              <div className="db-form-field">
                <label>{t('owner.restaurant.labelCloseTime')} <span>/ 閉店時間</span></label>
                <input type="time" className="db-input" required
                  value={restaurant.closeTime || ''}
                  onChange={(e) => handleInfoChange('closeTime', e.target.value)}
                />
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10 }}>
                <input type="checkbox" style={{ width: 18, height: 18, cursor: 'pointer' }} id="jp-support"
                  checked={restaurant.jpSupport || false}
                  onChange={(e) => handleInfoChange('jpSupport', e.target.checked)}
                />
                <label htmlFor="jp-support" style={{ cursor: 'pointer', fontWeight: 700 }}>{t('owner.restaurant.labelJpSupport')}</label>
              </div>
              <div className="db-form-field">
                <label>{t('owner.restaurant.labelLanguageSupport')} <span>/ 対応言語詳細</span></label>
                <input type="text" className="db-input" placeholder={t('owner.restaurant.placeholderLanguageSupport')}
                  value={restaurant.jpSupportText || ''}
                  onChange={(e) => handleInfoChange('jpSupportText', e.target.value)}
                />
              </div>
            </div>

            <div className="db-form-row" style={{ marginTop: 12 }}>
              <div className="db-form-field" style={{ gridColumn: 'span 2' }}>
                <label>{t('owner.restaurant.labelBanner')} <span>/ カバー写真 (URL)</span></label>
                <input type="text" className="db-input" placeholder={t('owner.restaurant.placeholderBanner')}
                  value={restaurant.banner || ''}
                  onChange={(e) => handleInfoChange('banner', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="submit" className="btn btn--primary">{t('owner.restaurant.btnSaveInfo')}</button>
            </div>
          </form>
        </div>

        {/* Menu Management Card */}
        <div className="db-card">
          <div className="db-card__title">
            <span>{t('owner.restaurant.cardMenu')}</span>
            <button className="btn btn--primary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => openMenuModal()}>
              {t('owner.restaurant.btnAddMenu')}
            </button>
          </div>

          <div className="db-menu-list">
            {restaurant.menu?.map((item: any, index: number) => (
              <div className="db-menu-card" key={index}>
                <div className="db-menu-card__icon">{item.icon || '🍣'}</div>
                <div className="db-menu-card__info">
                  <h4 className="db-menu-card__name">{item.name}</h4>
                  <div className="db-menu-card__price">{item.price}</div>
                  <p className="db-menu-card__desc">{item.desc || ''}</p>
                </div>
                <div className="db-menu-card__actions">
                  <button className="db-icon-btn" title={t('owner.restaurant.btnEditTooltip')} onClick={() => openMenuModal(index)}>✏️</button>
                  <button className="db-icon-btn db-icon-btn--danger" title={t('owner.restaurant.btnDeleteTooltip')} onClick={() => deleteMenuItem(index)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MENU MODAL */}
      {showMenuModal && (
        <div className="db-modal" style={{ display: 'flex' }}>
          <div className="db-modal__box">
            <h3 className="db-modal__title">{editingIndex !== null ? t('owner.restaurant.modalMenuTitleEdit') : t('owner.restaurant.modalMenuTitleAdd')}</h3>
            <form onSubmit={handleMenuSubmit}>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{t('owner.restaurant.labelMenuName')} <span>/ 料理名</span></label>
                <input type="text" className="db-input" required
                  value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Tên tiếng Nhật <span>/ 料理名 (日本語)</span></label>
                <input type="text" className="db-input"
                  value={menuForm.nameJp} onChange={e => setMenuForm({ ...menuForm, nameJp: e.target.value })} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{t('owner.restaurant.labelMenuPrice')} <span>/ 価格</span></label>
                <input type="text" className="db-input" placeholder={t('owner.restaurant.placeholderMenuPrice')} required
                  value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{t('owner.restaurant.labelMenuCat')} <span>/ カテゴリ</span></label>
                <select className="db-select" value={menuForm.cat} onChange={e => setMenuForm({ ...menuForm, cat: e.target.value })}>
                  <option value="sashimi">Sashimi</option>
                  <option value="tempura">Tempura</option>
                  <option value="ramen">Ramen</option>
                  <option value="dessert">Tráng miệng (Dessert)</option>
                </select>
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{t('owner.restaurant.labelMenuIcon')} <span>/ 絵文字</span></label>
                <input type="text" className="db-input" placeholder={t('owner.restaurant.placeholderMenuIcon')} required
                  value={menuForm.icon} onChange={e => setMenuForm({ ...menuForm, icon: e.target.value })} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>{t('owner.restaurant.labelMenuDesc')} <span>/ 説明</span></label>
                <textarea className="db-textarea" required
                  value={menuForm.desc} onChange={e => setMenuForm({ ...menuForm, desc: e.target.value })} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Mô tả tiếng Nhật <span>/ 説明 (日本語)</span></label>
                <textarea className="db-textarea"
                  value={menuForm.descJp} onChange={e => setMenuForm({ ...menuForm, descJp: e.target.value })} />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowMenuModal(false)}>{t('owner.restaurant.btnCancel')}</button>
                <button type="submit" className="modal__submit">{t('owner.restaurant.btnSubmit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
