@echo off
echo Git islemleri baslatiliyor...

git add .
echo Degisiklikler toplandi.

git commit -m "Son guncellemeler"
echo Degisiklikler paketlendi.

git push origin master
echo Paket GitHub'a gonderildi!

pause