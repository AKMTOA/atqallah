import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. تقديم الملفات الاستاتيكية (CSS, JS, الصور)
app.use(express.static(__dirname));

// 2. مسارات الـ API الخاصة بك
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'atqallah' });
});

// 3. التوجيه الشامل: إرجاع index.html عند طلب أي صفحة
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// تشغيل السيرفر محلياً فقط عند التطوير
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// 4. تصدير التطبيق لكي يعمل على Vercel
export default app;
