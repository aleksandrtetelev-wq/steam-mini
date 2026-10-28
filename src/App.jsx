import { useState, useEffect } from 'react';

const COMMISSION_RATE = 0.05;
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 500;

export default function App() {
  const [screen, setScreen] = useState('HOME'); 
  const [amount, setAmount] = useState(10);
  const [steamLogin, setSteamLogin] = useState('');
  const [finalPrice, setFinalPrice] = useState('0.00');
  const [orderCode, setOrderCode] = useState('');

  // Безопасная инициализация Telegram WebApp
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      // Применяем тему Telegram, если доступны параметры
      const bg = window.Telegram.WebApp.themeParams?.bg_color || '#1c1d22';
      const text = window.Telegram.WebApp.themeParams?.text_color || '#ffffff';
      
      document.body.style.backgroundColor = bg;
      document.body.style.color = text;
    } else {
      // Фолбэк для обычного браузера
      document.body.style.backgroundColor = '#1c1d22';
      document.body.style.color = '#ffffff';
    }
  }, []);

  // Расчет цены при изменении суммы
  useEffect(() => {
    if (amount > 0) {
      const commission = amount * COMMISSION_RATE;
      setFinalPrice((amount + commission).toFixed(2));
    } else {
      setFinalPrice('0.00');
    }
  }, [amount]);

  const handleProceedToConfirm = () => {
    if (!steamLogin.trim()) {
      alert('Введите логин Steam'); 
      return;
    }
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
        alert(`Сумма должна быть от $${MIN_AMOUNT} до $${MAX_AMOUNT}`);
        return;
    }
    setScreen('CONFIRM');
  };

  const handlePay = async () => {
    setScreen('PROCESSING');

    try {
      // Имитация обработки платежа (в реальном проекте тут запрос к API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fakeCode = generateRandomCode();
      setOrderCode(fakeCode);
      
      setScreen('SUCCESS');
      
      // Вибрация успеха в Telegram
      if (window.Telegram && window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

    } catch (error) {
      setScreen('ERROR');
      if (window.Telegram && window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderCode).then(() => {
        if (window.Telegram && window.Telegram.WebApp.showAlert) {
            window.Telegram.WebApp.showAlert('Код скопирован!');
        } else {
            alert('Код скопирован!');
        }
    });
  };

  const goBack = () => {
    if (screen === 'CONFIRM') setScreen('HOME');
    if (screen === 'SUCCESS' || screen === 'ERROR') setScreen('HOME');
  };

  // --- UI Компоненты ---

  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#2b2d36', borderBottom: '1px solid #3f414a' }}>
      <button onClick={goBack} disabled={screen === 'HOME'} style={{ background: 'transparent', border: 'none', color: screen === 'HOME' ? '#555' : '#fff', cursor: 'pointer', fontSize: '20px', padding: '0' }}>←</button>
      <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Steam Top-Up</h1>
      <div style={{ width: '20px' }}></div> {/* Плейсхолдер для центрирования */}
    </div>
  );

  const HomeScreen = () => (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
      {/* Карточка Логина */}
      <div style={{ backgroundColor: '#2b2d36', padding: '20px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #3f414a' }}>
        <label style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px', display: 'block' }}>Логин Steam</label>
        <input 
          type="text" 
          value={steamLogin}
          onChange={(e) => setSteamLogin(e.target.value)}
          placeholder="Например: Gamer_Pro"
          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#1c1d22', border: '1px solid #3f414a', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
        />
      </div>

      {/* Карточка Суммы */}
      <div style={{ backgroundColor: '#2b2d36', padding: '20px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #3f414a' }}>
        <label style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px', display: 'block' }}>Сумма пополнения ($)</label>
        <div style={{ position: 'relative' }}>
           <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#aaa', fontWeight: 'bold' }}>$</span>
           <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#1c1d22', border: '1px solid #3f414a', color: '#fff', paddingLeft: '28px', paddingRight: '12px', py: '12px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', outline: 'none' }}
          />
        </div>
        
        {/* Быстрые кнопки сумм */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '16px' }}>
          {[5, 10, 20, 50].map(val => (
            <button 
              key={val}
              onClick={() => setAmount(val)}
              style={{ 
                padding: '10px', 
                borderRadius: '8px', 
                border: amount === val ? '1px solid #2aabee' : '1px solid #3f414a',
                backgroundColor: amount === val ? '#2aabee' : '#1c1d22',
                color: amount === val ? '#fff' : '#aaa',
                fontWeight: amount === val ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ${val}
            </button>
          ))}
        </div>
      </div>

      {/* Итоговая сумма */}
      <div style={{ paddingHorizontal: '4px', paddingTop: '8px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
            <span>Комиссия ({COMMISSION_RATE * 100}%)</span>
            <span>${(amount * COMMISSION_RATE).toFixed(2)}</span>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #3f414a', paddingTop: '12px' }}>
            <span>Итого к оплате</span>
            <span style={{ color: '#2ecc71' }}>${finalPrice}</span>
         </div>
      </div>

      <button 
        onClick={handleProceedToConfirm}
        style={{ width: '100%', backgroundColor: '#2aabee', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '24px', fontSize: '16px', boxShadow: '0 4px 12px rgba(42, 171, 238, 0.3)' }}
      >
        Продолжить →
      </button>
    </div>
  );

  const ConfirmScreen = () => (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
       <div style={{ backgroundColor: '#2b2d36', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #3f414a', marginBottom: '24px' }}>
          <p style={{ color: '#aaa', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Пополняем счет:</p>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', wordBreak: 'break-all' }}>{steamLogin}</h2>
          
          <div style={{ borderTop: '1px solid #3f414a', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <span style={{ color: '#aaa' }}>Баланс Steam:</span>
             <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '18px' }}>${amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span style={{ color: '#aaa' }}>Оплата картой/crypto:</span>
             <span style={{ fontWeight: 'bold', fontSize: '18px' }}>${finalPrice}</span>
          </div>
       </div>

       <button 
        onClick={handlePay}
        style={{ width: '100%', backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)' }}
      >
        Оплатить ${finalPrice}
      </button>
    </div>
  );

  const ProcessingScreen = () => (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '48px', animation: 'spin 1s linear infinite', marginBottom: '16px' }}>⏳</div>
      <p style={{ fontSize: '18px', fontWeight: '500' }}>Обрабатываем платеж...</p>
      <p style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>Не закрывайте окно</p>
    </div>
  );

  const SuccessScreen = () => (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', color: '#2ecc71', marginBottom: '16px' }}>✅</div>
      <h2 style={{ margin: '0 0 8px 0' }}>Успешно!</h2>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>Ваш код готов.</p>
      
      <div style={{ backgroundColor: '#1c1d22', padding: '20px', borderRadius: '12px', border: '1px dashed #2ecc71', marginBottom: '24px', position: 'relative' }}>
        <p style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Steam Wallet Code</p>
        <p style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', wordBreak: 'break-all', lineHeight: '1.4' }}>{orderCode}</p>
        <button 
          onClick={copyToClipboard}
          style={{ position: 'absolute', right: '10px', top: '10px', background: '#3f414a', border: 'none', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
        >
          Копировать
        </button>
      </div>

      <button 
        onClick={() => window.open('https://store.steampowered.com/account/registerkey', '_blank')}
        style={{ width: '100%', backgroundColor: '#2aabee', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', fontSize: '16px' }}
      >
        Открыть Steam
      </button>
      <button 
        onClick={() => setScreen('HOME')}
        style={{ width: '100%', backgroundColor: '#3f414a', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
      >
        Новый заказ
      </button>
    </div>
  );

  const ErrorScreen = () => (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', color: '#e74c3c', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ margin: '0 0 8px 0' }}>Ошибка</h2>
      <p style={{ color: '#aaa', backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(231, 76, 60, 0.3)', marginBottom: '24px' }}>Произошла ошибка сети. Попробуйте снова.</p>
      <button 
        onClick={() => setScreen('HOME')}
        style={{ width: '100%', backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
      >
        Назад
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <Header />
      <div style={{ paddingTop: '16px' }}>
        {screen === 'HOME' && <HomeScreen />}
        {screen === 'CONFIRM' && <ConfirmScreen />}
        {screen === 'PROCESSING' && <ProcessingScreen />}
        {screen === 'SUCCESS' && <SuccessScreen />}
        {screen === 'ERROR' && <ErrorScreen />}
      </div>
      
      {/* CSS Анимации */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input:focus { border-color: #2aabee !important; }
        button:hover { opacity: 0.9; }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}

function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 25; i++) {
    if (i > 0 && i % 5 === 0) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
