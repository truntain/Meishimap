'use client';

import { useEffect, useState } from 'react';
import OwnerHeader from './components/OwnerHeader';
import Cookies from 'js-cookie';
import { getBeautifulImage } from '@/utils/image';


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
    { name: 'Premium Sashimi Set', price: '450.000đ', cat: 'sashimi', icon: '🐟', imageUrl: '', desc: 'A curated selection of seasonal fish including Otoro, Sake, and Hamachi.' },
    { name: 'Sashimi Deluxe', price: '380.000đ', cat: 'sashimi', icon: '🍱', imageUrl: '', desc: 'Premium cut fish with authentic wasabi and soy sauce.' },
    { name: 'Tempura Set', price: '280.000đ', cat: 'tempura', icon: '🍤', imageUrl: '', desc: 'Crispy light-battered shrimp and vegetables with dipping sauce.' },
    { name: 'Tonkotsu Ramen', price: '195.000đ', cat: 'ramen', icon: '🍜', imageUrl: '', desc: 'Rich pork bone broth simmered 18 hours, chashu pork, soft egg.' }
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
  const [menuForm, setMenuForm] = useState({ name: '', price: '', cat: 'sashimi', icon: '🍣', imageUrl: '', desc: '' });

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
          showAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
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
  }, []);

  const showAlert = (msg: string, type = 'success') => {
    setAlertMsg({ msg, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('meshimap_restaurant', JSON.stringify(restaurant));

    const token = Cookies.get('access_token');
    if (!token) {
      showAlert('Lưu thông tin thành công (Offline)!');
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
        showAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
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
      showAlert('Lưu thông tin nhà hàng lên hệ thống thành công!');
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi kết nối: ${err.message || 'Không thể lưu lên hệ thống'}`, 'warning');
    }
  };


  const handleInfoChange = (field: string, value: any) => {
    setRestaurant((prev: any) => ({ ...prev, [field]: value }));
  };

  const isRealImage = (url: string | null) => {
    if (!url) return false;
    const clean = url.toLowerCase();
    return (
      clean.startsWith('http://') ||
      clean.startsWith('https://') ||
      clean.startsWith('/uploads/') ||
      clean.startsWith('uploads/') ||
      clean.startsWith('data:image/')
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Kích thước ảnh tối đa là 5MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Kích thước ảnh tối đa là 5MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInfoChange('banner', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openMenuModal = (index: number | null = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const item = restaurant.menu[index];
      setMenuForm({
        name: item.name || '',
        price: typeof item.price === 'number' ? `${item.price}` : (item.price || ''),
        cat: item.cat || item.category || 'sashimi',
        icon: item.icon || item.emoji || '🍣',
        imageUrl: item.imageUrl || item.image_url || '',
        desc: item.desc || item.description || '',
      });
    } else {
      setMenuForm({ name: '', price: '', cat: 'sashimi', icon: '🍣', imageUrl: '', desc: '' });
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

    const cleanPrice = typeof menuForm.price === 'number' ? menuForm.price : (parseInt(String(menuForm.price).replace(/[^\d]/g, '')) || 0);
    const body = {
      name: menuForm.name,
      price: cleanPrice,
      category: menuForm.cat,
      icon: menuForm.icon,
      imageUrl: menuForm.imageUrl || '',
      description: menuForm.desc,
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
        showAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
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
      showAlert(editingIndex !== null ? 'Đã cập nhật món ăn!' : 'Đã thêm món ăn mới!');
      setShowMenuModal(false);
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message || 'Không thể cập nhật món ăn'}`, 'warning');
    }
  };

  const deleteMenuItem = async (index: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa món ăn này khỏi thực đơn không?')) {
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
      showAlert('Đã xóa món ăn khỏi thực đơn!', 'warning');
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
        showAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
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
      showAlert('Đã xóa món ăn khỏi thực đơn!', 'warning');
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi: ${err.message || 'Không thể xóa món ăn'}`, 'warning');
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
                <label>Hình ảnh banner <span>/ カバー写真</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="db-input" 
                  onChange={handleBannerFileChange} 
                />
                {isRealImage(restaurant.banner) && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--clr-muted)' }}>Ảnh hiện tại:</span>
                    <img 
                      src={restaurant.banner.startsWith('data:') ? restaurant.banner : getBeautifulImage(restaurant.banner, restaurant.name)} 
                      alt="Banner preview" 
                      style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--clr-border)' }} 
                    />
                    <button 
                      type="button" 
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        background: '#fee2e2',
                        border: '1px solid #fcd34d',
                        borderRadius: 4,
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      onClick={() => handleInfoChange('banner', '')}
                    >
                      Xóa ảnh / 削除
                    </button>
                  </div>
                )}
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
                <div className="db-menu-card__icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isRealImage(item.imageUrl || item.image_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getBeautifulImage(item.imageUrl || item.image_url, item.name)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    item.icon || '🍣'
                  )}
                </div>
                <div className="db-menu-card__info">
                  <h4 className="db-menu-card__name">{item.name}</h4>
                  <div className="db-menu-card__price">{item.price}</div>
                  <p className="db-menu-card__desc">{item.desc || item.description || ''}</p>
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
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="text" className="db-input" placeholder="Ví dụ: 🍣, 🍥, 🍜" required 
                    value={menuForm.icon} onChange={e => setMenuForm({...menuForm, icon: e.target.value})} style={{ flex: 1 }} />
                  <div style={{ fontSize: 24, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-cream)', borderRadius: 8, border: '1px solid var(--clr-border)' }}>
                    {menuForm.icon || '🍣'}
                  </div>
                </div>
              </div>
              <div className="db-form-field" style={{ marginBottom: 12 }}>
                <label>Hình ảnh món ăn <span>/ 料理写真</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="db-input" 
                  onChange={handleFileChange} 
                />
                {isRealImage(menuForm.imageUrl) && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--clr-muted)' }}>Xem trước:</span>
                    <img 
                      src={menuForm.imageUrl.startsWith('data:') ? menuForm.imageUrl : getBeautifulImage(menuForm.imageUrl, menuForm.name)} 
                      alt="Preview" 
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--clr-border)' }} 
                    />
                    <button 
                      type="button" 
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        background: '#fee2e2',
                        border: '1px solid #fcd34d',
                        borderRadius: 4,
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      onClick={() => setMenuForm(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      Xóa ảnh / 削除
                    </button>
                  </div>
                )}
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
