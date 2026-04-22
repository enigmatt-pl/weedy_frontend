# Weedy Frontend

Weedy to nowoczesna aplikacja webowa zaprojektowana do wyszukiwania lokalnych dispensaries w Polsce. Wykorzystuje zaawansowaną analitykę i dane w czasie rzeczywistym, aby pomóc pacjentom i klientom znaleźć najlepsze punkty w ich okolicy.

## 🚀 Główne Funkcje

- **Inteligentna Mapa**: Lokalizacja punktów w czasie rzeczywistym z uwzględnieniem godzin otwarcia.
- **Weedy Analytics**: Zaawansowane dane rynkowe dla użytkowników i właścicieli punktów.
- **Weryfikowane Opinie**: System opinii oparty na zaufaniu społeczności.
- **Zintegrowany Panel**: Narzędzia do zarządzania informacjami o punktach i ich asortymencie.
- **Nowoczesny UI/UX**: Intuicyjny interfejs z motywem dispensary, responsywnym designem i płynnymi przejściami.

## 🛠 Technologie

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Język**: TypeScript
- **Stylizacja**: Tailwind CSS
- **Zarządzanie Stanem**: Zustand
- **Formularze**: React Hook Form + Zod
- **Ikony**: Lucide React
- **Komunikacja API**: Axios

## 📋 Wymagania

- Node.js (wersja 18 lub nowsza)
- npm lub yarn

## ⚙️ Instalacja i Uruchomienie

1. **Sklonuj repozytorium:**
   ```bash
   git clone <url-repozytorium>
   cd moto_wrzutka_frontend
   ```

2. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

3. **Konfiguracja zmiennych środowiskowych:**
   Utwórz plik `.env` w głównym katalogu i dodaj adres URL backendu:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   
   > [!IMPORTANT]
   > Wersja produkcyjna aplikacji korzysta ze zmiennych środowiskowych skonfigurowanych w **GitHub Secrets**. Przed wdrożeniem przez CI/CD upewnij się, że klucze są tam poprawnie zdefiniowane.

4. **Uruchom wersję deweloperską:**
   ```bash
   npm run dev
   ```
   Aplikacja będzie dostępna pod adresem `http://localhost:5173`.

## 🧪 Testy

Aplikacja posiada zestaw testów jednostkowych i integracyjnych dla kluczowych funkcjonalności (np. logowanie, rejestracja).

- **Uruchomienie testów:**
  ```bash
  npm test
  ```

- **Uruchomienie testów w trybie UI (Vitest UI):**
  ```bash
  npm run test:ui
  ```

## 🏗 Budowa Wersji Produkcyjnej

Aby zbudować zoptymalizowaną wersję aplikacji do wdrożenia:

```bash
npm run build
```

Pliki produkcyjne zostaną wygenerowane w katalogu `dist/`.
 
 ## 🌐 Wdrożenie (Cloudflare Pages)
 
 Aby wdrożyć aplikację na produkcję:
 
 ```bash
 npm run deploy
 ```

---
© 2026 Weedy Team. Wszelkie prawa zastrzeżone.
