$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -UseBasicParsing
Write-Host $response.StatusCode
Write-Host $response.Content