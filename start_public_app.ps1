$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = 'C:\Users\dell\.local\bin\python3.14.exe'
$cloudflared = Join-Path $project '.tools\cloudflared.exe'

Start-Process -FilePath $python -ArgumentList @('-u', (Join-Path $project 'main.py')) -WorkingDirectory $project
Start-Process -FilePath $cloudflared -ArgumentList @('tunnel', '--url', 'http://localhost:8080') -WorkingDirectory $project
