$response = Invoke-WebRequest -Uri "http://localhost:5173/" -Method GET -UseBasicParsing
Write-Host $response.StatusCode
Write-Host ($response.Content -split "`n" | select -first 5)