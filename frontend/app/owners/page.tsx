'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from './components/OwnerHeader';

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
  const [alertMsg, setAlertMsg] = useState<{msg: string, type: string} | null>(null);
  
  // Menu Modal State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', cat: 'sashimi', icon: '🍣', desc: '' });

  useEffect(() => {
    const stored = localStorage.getItem('meshimap_restaurant');
    if (stored) {
      setRestaurant(JSON.parse(stored));
    } else {
      setRestaurant(defaultRestaurant);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(defaultRestaurant));
    }
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('meshimap_restaurant', JSON.stringify(restaurant));
    showAlert('Lưu thông tin nhà hàng thành công!');
  };

  const handleInfoChange = (field: string, value: any) => {
    setRestaurant((prev: any) => ({ ...prev, [field]: value }));
  };

  const openMenuModal = (index: number | null = null) => {
    setEditingIndex(index);
    if (index !== null) {
      setMenuForm(restaurant.menu[index]);
    } else {
      setMenuForm({ name: '', price: '', cat: 'sashimi', icon: '🍣', desc: '' });
    }
    setShowMenuModal(true);
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...restaurant };
    if (editingIndex !== null) {
      updated.menu[editingIndex] = menuForm;
      showAlert('Đã cập nhật món ăn!');
    } else {
      updated.menu.push(menuForm);
      showAlert('Đã thêm món ăn mới!');
    }
    setRestaurant(updated);
    localStorage.setItem('meshimap_restaurant', JSON.stringify(updated));
    setShowMenuModal(false);
  };

  const deleteMenuItem = (index: number) => {
    if (window.confirm('Bạn có chắc muốn xóa món ăn này khỏi thực đơn không?')) {
      const updated = { ...restaurant };
      updated.menu.splice(index, 1);
      setRestaurant(updated);
      localStorage.setItem('meshimap_restaurant', JSON.stringify(updated));
      showAlert('Đã xóa món ăn khỏi thực đơn!', 'warning');
    }
  };

  if (!restaurant) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <>
      <OwnerHeader title="Quản lý thông tin nhà hàng" />
      <div className="db-content">
        {alertMsg && (
          <div className={`db-alert db-alert--${alertMsg.type}`}>
            <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alertMsg.msg}</span>
          </div>
        )}

        {/* General Info Card */}
        <div className="db-card">
          <h2 className="db-card__title">Thông tin chung nhà hàng</h2>
          <form onSubmit={handleInfoSubmit}>
            <div className="db-form-row">
              <div className="db-form-field">
                <label>Tên nhà hàng <span>/ 店名</span></label>
                <input type="text" className="db-input" required 
                  value={restaurant.name || ''} 
                  onChange={(e) => handleInfoChange('name', e.target.value)} 
                />
              </div>
              <div className="db-form-field">
                <label>Số điện thoại <span>/ 電話番号</span></label>
                <input type="text" className="db-input" required 
                  value={restaurant.phone || ''} 
                  onChange={(e) => handleInfoChange('phone', e.target.value)} 
                />
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field" style={{ gridColumn: 'span 2' }}>
                <label>Địa chỉ nhà hàng <span>/ 住所</span></label>
                <input type="text" className="db-input" required 
                  value={restaurant.address || ''} 
                  onChange={(e) => handleInfoChange('address', e.target.value)} 
                />
              </div>
            </div>

            <div className="db-form-row">
              <div className="db-form-field">
                <label>Giờ mở cửa <span>/ 開店時間</span></label>
                <input type="time" className="db-input" required 
                  value={restaurant.openTime || ''} 
                  onChange={(e) => handleInfoChange('openTime', e.target.value)} 
                />
              </div>
              <div className="db-form-field">
                <label>Giờ đóng cửa <span>/ 閉店時間</span></label>
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
                <label htmlFor="jp-support" style={{ cursor: 'pointer', fontWeight: 700 }}>Hỗ trợ tiếng Nhật / 日本語対応あり</label>
              </div>
              <div className="db-form-field">
                <label>Thông tin hỗ trợ ngôn ngữ <span>/ 対応言語詳細</span></label>
                <input type="text" className="db-input" placeholder="Ví dụ: Tiếng Việt, Tiếng Nhật, English" 
                  value={restaurant.jpSupportText || ''} 
                  onChange={(e) => handleInfoChange('jpSupportText', e.target.value)} 
                />
              </div>
            </div>

            <div className="db-form-row" style={{ marginTop: 12 }}>
              <div className="db-form-field" style={{ gridColumn: 'span 2' }}>
                <label>Hình ảnh banner (URL) <span>/ カバー写真 (URL)</span></label>
                <input type="text" className="db-input" placeholder="Nhập link ảnh (để trống sẽ dùng ảnh mặc định)" 
                  value={restaurant.banner || ''} 
                  onChange={(e) => handleInfoChange('banner', e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="submit" className="btn btn--primary">Lưu thông tin nhà hàng</button>
            </div>
          </form>
        </div>

        {/* Menu Management Card */}
        <div className="db-card">
          <div className="db-card__title">
            <span>Danh mục thực đơn (Menu Items)</span>
            <button className="btn btn--primary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => openMenuModal()}>
              Thêm món ăn
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
                  <button className="db-icon-btn" title="Sửa món" onClick={() => openMenuModal(index)}>✏️</button>
                  <button className="db-icon-btn db-icon-btn--danger" title="Xóa món" onClick={() => deleteMenuItem(index)}>🗑️</button>
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
            <h3 className="db-modal__title">{editingIndex !== null ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</h3>
            <form onSubmit={handleMenuSubmit}>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Tên món ăn <span>/ 料理名</span></label>
                <input type="text" className="db-input" required 
                  value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Giá món ăn <span>/ 価格</span></label>
                <input type="text" className="db-input" placeholder="Ví dụ: 150.000đ" required 
                  value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Phân loại <span>/ カテゴリ</span></label>
                <select className="db-select" value={menuForm.cat} onChange={e => setMenuForm({...menuForm, cat: e.target.value})}>
                  <option value="sashimi">Sashimi</option>
                  <option value="tempura">Tempura</option>
                  <option value="ramen">Ramen</option>
                  <option value="dessert">Tráng miệng (Dessert)</option>
                </select>
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Biểu tượng (Emoji) <span>/ 絵文字</span></label>
                <input type="text" className="db-input" placeholder="Ví dụ: 🍣, 🍥, 🍜" required 
                  value={menuForm.icon} onChange={e => setMenuForm({...menuForm, icon: e.target.value})} />
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Mô tả chi tiết <span>/ 説明</span></label>
                <textarea className="db-textarea" required 
                  value={menuForm.desc} onChange={e => setMenuForm({...menuForm, desc: e.target.value})} />
              </div>
              <div className="db-modal__actions">
                <button type="button" className="modal__cancel" onClick={() => setShowMenuModal(false)}>Hủy</button>
                <button type="submit" className="modal__submit">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
