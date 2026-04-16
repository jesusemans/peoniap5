# 🌸 Peonía Modernized & Audited

[![React](https://img.shields.io/badge/React-18+-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![p5.js](https://img.shields.io/badge/p5.js-1.9+-ED225D?logo=p5.js&logoColor=white)](https://p5js.org/)

A modernized, high-performance refactor of the classic generative art project **Peonía**. This version translates the original global p5.js math into a structured React + TypeScript architecture, introducing modern interaction patterns and immersive media.

---

## 🇹🇷 Türkçe (Denetim Notları)

### 📖 Genel Bakış
**Peonía Modernized**, klasik bir generatif sanat projesinin modern mühendislik standartlarına (Senior Engineering Audit) göre yeniden yapılandırılmış halidir. Proje, p5.js'i **Instance Mode**'da kullanarak React'in state yönetimi ile tam uyumlu ve modüler bir yapıda çalışır.

### 🛠️ Yapılan Teknik İyileştirmeler (Technical Audit)
Proje üzerinde gerçekleştirilen kapsamlı denetim sonucunda şu kritik iyileştirmeler yapılmıştır:
- **Güvenlik:** Tüm bağımlılıklar (Vite, esbuild) güncellendi, zaafiyetler giderildi.
- **Mimari:** "God Component" yapısı yıkılarak mantık; Hook, Painter, Math ve Processor katmanlarına ayrıldı.
- **Performans:** `manualChunks` ile vendor paketleri ayrıldı, `React.lazy` ile dinamik yükleme sağlandı.
- **Erişilebilirlik:** `aria-label` etiketleri, mobil uyumlu dokunma alanları ve kontrast iyileştirmeleri eklendi.
- **Tip Güvenliği:** `any` kullanımı temizlendi, `strict` TypeScript mimarisine geçildi.

### 🚀 Kurulum
```bash
npm install
npm run dev
```

---

## 🇺🇸 English Version

### 📖 Overview
**Peonía Modernized** is a digital garden experience. It evolves the original generative flower logic into a scalable web application. Using p5.js in "Instance Mode", the project encapsulates complex 3D math and pixel manipulation within a reactive state management system.

### ✨ Key Features
- **🖼️ Image Injection:** Upload your own photos with a robust center-crop algorithm.
- **🎧 Immersive Audio:** User-triggered starting sequence to comply with browser policies.
- **🎨 Minimalist UX:** Text-only, low-opacity controls for clean aesthetics.
- **⚡ Performance First:** Optimized with `manualChunks`, `Suspense`, and `offscreen buffering`.
- **🔘 Adaptive Rendering:** Toggle between `ASCII`, `DOTS`, and `PIXEL` modes.

---

## 🇪🇸 Versión en Español

### 📖 Resumen
**Peonía Modernized** es una experiencia de jardín digital. Evoluciona la lógica original de las flores generativas hacia una aplicación web escalable. El proyecto encapsula matemáticas 3D complejas y manipulación de píxeles dentro de un sistema de gestión de estado reactivo.

---

## 🏗️ Architecture & Documentation

For detailed technical information, please refer to:
- [Architecture Guide (Mimarī)](file:///c:/Users/Efe/Desktop/peoniap5/ARCHITECTURE.md)
- [In-code JSDoc Documentation](file:///c:/Users/Efe/Desktop/peoniap5/src/hooks/useSketch.ts)

### 🤝 Acknowledgements
This project is a tribute to the original creative work by [**jesusemans**](https://github.com/jesusemans).
