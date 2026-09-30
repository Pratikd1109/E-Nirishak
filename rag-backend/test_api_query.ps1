# PowerShell script to test RAG API and show results clearly

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "Testing RAG API - Sarvam vs Gemini" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan

# Test 1: Simple question
Write-Host "`nTest 1: Simple Question" -ForegroundColor Green
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

$question1 = "What is the Jan Vishwas Act?"
Write-Host "Question: $question1" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/query" `
        -ContentType "application/json" `
        -Body (@{question = $question1} | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "`nAnswer:" -ForegroundColor Cyan
    Write-Host $response.answer -ForegroundColor White
    
    Write-Host "`nSources:" -ForegroundColor Cyan
    $response.sources | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    
    Write-Host "`n✓ Test 1 PASSED" -ForegroundColor Green
} catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
    Write-Host "Make sure the FastAPI server is running on port 8000" -ForegroundColor Yellow
}

# Test 2: Legal Metrology question
Write-Host "`n`nTest 2: Legal Metrology Question" -ForegroundColor Green
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

$question2 = "What are the verification requirements for weighing instruments?"
Write-Host "Question: $question2" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/query" `
        -ContentType "application/json" `
        -Body (@{question = $question2} | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "`nAnswer:" -ForegroundColor Cyan
    Write-Host $response.answer -ForegroundColor White
    
    Write-Host "`n✓ Test 2 PASSED" -ForegroundColor Green
} catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
}

# Test 3: Hindi-related question (to test Sarvam's strength)
Write-Host "`n`nTest 3: Question with Indian Context" -ForegroundColor Green
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

$question3 = "What penalties are mentioned in the Jan Vishwas Act for non-compliance?"
Write-Host "Question: $question3" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/query" `
        -ContentType "application/json" `
        -Body (@{question = $question3} | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "`nAnswer:" -ForegroundColor Cyan
    Write-Host $response.answer -ForegroundColor White
    
    Write-Host "`n✓ Test 3 PASSED" -ForegroundColor Green
} catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "Tests Complete" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan

Write-Host "`nIMPORTANT: Check your FastAPI server console to see which model was used!" -ForegroundColor Yellow
Write-Host "Look for these log messages:" -ForegroundColor White
Write-Host "  - 'Sarvam returned answer' = Sarvam AI worked ✓" -ForegroundColor Green
Write-Host "  - 'Falling back to Gemini' = Sarvam returned empty, used Gemini" -ForegroundColor Yellow
