# credX

coding in progress

![image by pixeljeff on www.deviantart.com](https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c83c004e-1370-4756-88e5-4071de797088/dgdq8br-09cc7ad6-a021-47a5-b0e0-917b12b0f7a7.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2M4M2MwMDRlLTEzNzAtNDc1Ni04OGU1LTQwNzFkZTc5NzA4OFwvZGdkcThici0wOWNjN2FkNi1hMDIxLTQ3YTUtYjBlMC05MTdiMTJiMGY3YTcuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.tqRMtE-b2QiI2nnefNxSDMJvZCcYqFmq2ccg_Xfzqb8)

# Contributing

Follow below steps to setup development environment:

```bash
git clone https://github.com/vedantjain8/credx.git
cd credx/web
# -- Rename .env.example to .env --
# -- Edit .env file to add required credentials --
npm install
npm run migrate up
npx prisma db pull
npx prisma generate
npm run dev

cd ../microservices
# -- Rename .env.example to .env --
# -- Edit .env file to add required credentials --
pip install -r requirements.txt
```
