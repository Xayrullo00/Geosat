# AgroSat UZ — Web Platform

**Kosmosdan dalangizgacha — AI bilan**

Telegram bot o‘rniga to‘liq web ilova: xavfsiz login/parol, 3 til (O‘zbek, Rus, Ingliz), fermer profili, kosmik monitoring, NASA ob-havo, AI maslahat va boshqa modullar.

## Xavfsizlik

- **Default login/parol yo‘q** — faqat ro‘yxatdan o‘tish
- Parol: kamida 8 belgi, katta/kichik harf + raqam
- `SECRET_KEY` majburiy (32+ belgi, tasodifiy)
- Parollar bcrypt bilan hash qilinadi
- JWT autentifikatsiya

## Tez ishga tushirish

### 1. Backend

```powershell
cd C:\Users\Xayrullo\Projects\agrosat-uz\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

`.env` faylida `SECRET_KEY` ni to‘ldiring:

```powershell
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(48))"
```

Natijani `.env` ga qo‘ying. Ixtiyoriy: `ANTHROPIC_API_KEY` (AI + rasm tahlili).

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend

```powershell
cd C:\Users\Xayrullo\Projects\agrosat-uz\frontend
npm install
npm run dev
```

Brauzer: http://localhost:5173

## Modullar

| Modul | API / funksiya |
|-------|----------------|
| Kosmik monitoring | Sentinel-2 uslubida NDVI, zonalar, EVI, NDWI |
| Ob-havo | NASA POWER (haqiqiy API) |
| Sug'orish | Ha/Yo'q tavsiya |
| Kasallik | Rasm + AI (Claude API ixtiyoriy) |
| Agrotakvim | 7 kunlik reja |
| Hosil prognozi | Crowd-sourced + agregatsiya |
| Ekin tavsiyasi | Farg'ona ROI |
| AI maslahat | Claude yoki fallback |
| Dalalar | GPS koordinata, monitoring |

## Loyiha tuzilmasi

```
agrosat-uz/
  backend/     FastAPI + SQLite
  frontend/    React + Vite + Tailwind + i18n
```

## Hackathon demo

1. Ro‘yxatdan o‘ting (o‘z email va kuchli parol)
2. 3 qadamli profil + dala qo‘shing
3. Sun‘iy yo‘ldosh va Ob-havo modullarini oching
4. Hosil prognoziga ma’lumot qo‘shing
