# Design System - BarberManager

## 1. Visão Geral

Este documento define o sistema de design do BarberManager, baseado no padrão visual estabelecido na tela de login. O objetivo é garantir consistência visual, usabilidade e uma experiência profissional em todas as interfaces do sistema.

## 2. Paleta de Cores

### 2.1 Cores Primárias
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Primary Blue**: `#667eea`
- **Primary Purple**: `#764ba2`

### 2.2 Cores Neutras
- **Dark Text**: `#2d3748`
- **Medium Text**: `#4a5568`
- **Light Text**: `#718096`
- **Placeholder**: `#a0aec0`
- **Border**: `#e2e8f0`
- **Background Light**: `#f7fafc`
- **Background Medium**: `#edf2f7`

### 2.3 Cores de Estado
- **Success**: `#38a169`
- **Error**: `#c53030`
- **Error Background**: `linear-gradient(135deg, #fed7d7, #feb2b2)`
- **Error Border**: `#fc8181`
- **Warning**: `#d69e2e`
- **Info**: `#3182ce`

### 2.4 Cores de Overlay
- **White Overlay**: `rgba(255, 255, 255, 0.95)`
- **White Transparent**: `rgba(255, 255, 255, 0.1)`
- **White Border**: `rgba(255, 255, 255, 0.2)`
- **White Subtle**: `rgba(255, 255, 255, 0.3)`

## 3. Tipografia

### 3.1 Hierarquia de Títulos
- **H1 (Brand Title)**: `3rem`, `font-weight: 700`
- **H2 (Mobile Logo)**: `2rem`, `font-weight: 700`
- **H3 (Form Header)**: `1.8rem`, `font-weight: 700`
- **H4 (Feature Title)**: `1.1rem`, `font-weight: 600`

### 3.2 Texto Corpo
- **Body Large**: `1.2rem` (brand subtitle)
- **Body Regular**: `1rem` (form inputs, buttons)
- **Body Medium**: `0.95rem` (labels, demo headers)
- **Body Small**: `0.9rem` (feature descriptions, security badge)
- **Body Extra Small**: `0.85rem` (copyright, demo credentials)

### 3.3 Pesos de Fonte
- **Bold**: `font-weight: 700` (títulos principais)
- **Semi-bold**: `font-weight: 600` (subtítulos, labels)
- **Medium**: `font-weight: 500` (alerts, botões)
- **Regular**: `font-weight: 400` (texto padrão)

## 4. Espaçamentos

### 4.1 Sistema de Espaçamento (baseado em rem)
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `0.75rem` (12px)
- **lg**: `1rem` (16px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `2rem` (32px)
- **4xl**: `2.5rem` (40px)
- **5xl**: `3rem` (48px)

### 4.2 Aplicações Específicas
- **Form Groups**: `margin-bottom: 1.5rem`
- **Card Padding**: `2rem` (desktop), `1.5rem` (mobile)
- **Section Padding**: `3rem` (desktop), `2rem` (mobile)
- **Button Padding**: `1rem 2rem` (desktop), `0.875rem 1.5rem` (mobile)

## 5. Componentes de UI

### 5.1 Botões

#### Botão Primário (.modern-btn)
```css
.modern-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  min-height: 56px;
  transition: all 0.3s ease;
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}
```

#### Estados do Botão
- **Hover**: `transform: translateY(-2px)` + shadow
- **Active**: `transform: translateY(0)`
- **Disabled**: `opacity: 0.7`, `cursor: not-allowed`
- **Loading**: Spinner branco + texto "Carregando..."

### 5.2 Inputs (.modern-input)

#### Input Padrão
```css
.modern-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #fff;
  transition: all 0.3s ease;
}

.modern-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}
```

#### Labels
```css
.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}
```

### 5.3 Cards

#### Card Principal
```css
.main-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

#### Card Secundário
```css
.secondary-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.secondary-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}
```

### 5.4 Alerts

#### Alert de Erro
```css
.custom-alert {
  background: linear-gradient(135deg, #fed7d7, #feb2b2);
  border: 1px solid #fc8181;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #c53030;
  font-weight: 500;
}
```

## 6. Animações e Transições

### 6.1 Transições Padrão
- **Suave**: `transition: all 0.3s ease`
- **Rápida**: `transition: all 0.2s ease`
- **Cubic Bezier**: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### 6.2 Animações de Entrada
```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-up {
  animation: slideInUp 0.6s ease forwards;
}
```

### 6.3 Animações de Loading
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

## 7. Layout e Grid

### 7.1 Container Principal
- **Max Width**: `1200px`
- **Padding**: `2rem` (desktop), `1rem` (mobile)
- **Margin**: `0 auto`

### 7.2 Grid System
- **Features Grid**: `grid-template-columns: repeat(2, 1fr)`
- **Gap**: `2rem` (desktop), `1rem` (mobile)

### 7.3 Flexbox Patterns
- **Center**: `display: flex; align-items: center; justify-content: center`
- **Space Between**: `display: flex; justify-content: space-between; align-items: center`
- **Column**: `display: flex; flex-direction: column; gap: 1rem`

## 8. Responsividade

### 8.1 Breakpoints
- **Mobile**: `max-width: 575.98px`
- **Tablet**: `max-width: 991.98px`
- **Desktop**: `min-width: 992px`

### 8.2 Adaptações Mobile
- **Padding**: Reduzir de `2.5rem` para `1.5rem`
- **Font Size**: Reduzir títulos em `0.5rem`
- **Button Height**: Reduzir de `56px` para `50px`
- **Grid**: Converter para `grid-template-columns: 1fr`

## 9. Acessibilidade

### 9.1 Focus States
```css
.focusable:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

### 9.2 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 10. Iconografia

### 10.1 Biblioteca de Ícones
- **Font Awesome 6** (fas, far, fab)
- **Tamanhos**: `1rem`, `1.1rem`, `2rem`
- **Cores**: Primary (`#667eea`), Success (`#38a169`), Text (`#2d3748`)

### 10.2 Ícones Comuns
- **Login**: `fas fa-sign-in-alt`
- **Dashboard**: `fas fa-chart-line`
- **Usuários**: `fas fa-users`
- **Configurações**: `fas fa-cog`
- **Segurança**: `fas fa-shield-alt`
- **Sucesso**: `fas fa-check-circle`
- **Erro**: `fas fa-exclamation-triangle`

## 11. Background e Efeitos

### 11.1 Background Principal
```css
.main-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
```

### 11.2 Floating Shapes
- **Formas circulares** com `border-radius: 50%`
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Animação**: `float 20s infinite linear`
- **Tamanhos variados**: `60px` a `140px`

### 11.3 Backdrop Filter
- **Blur Principal**: `backdrop-filter: blur(20px)`
- **Blur Secundário**: `backdrop-filter: blur(10px)`

## 12. Implementação

### 12.1 Estrutura CSS
1. **Reset/Base styles**
2. **Variables (CSS Custom Properties)**
3. **Layout components**
4. **UI components**
5. **Utilities**
6. **Responsive**

### 12.2 Nomenclatura (BEM)
- **Block**: `.card`
- **Element**: `.card__header`
- **Modifier**: `.card--primary`

### 12.3 Organização de Arquivos
```
styles/
├── base/
│   ├── reset.css
│   ├── variables.css
│   └── typography.css
├── components/
│   ├── buttons.css
│   ├── forms.css
│   ├── cards.css
│   └── alerts.css
├── layout/
│   ├── grid.css
│   └── containers.css
└── utilities/
    ├── spacing.css
    └── animations.css
```

Este design system serve como base para manter consistência visual em todas as telas do BarberManager, garantindo uma experiência de usuário profissional e coesa.