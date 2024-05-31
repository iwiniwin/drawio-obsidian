set VAR="E:\Obsidian\Notes\.obsidian\plugins\drawio-obsidian"
xcopy /y /c /h /r "dist\main.js" %VAR%
xcopy /y /c /h /r "dist\manifest.json" %VAR%
xcopy /y /c /h /r "dist\styles.css" %VAR%
pause