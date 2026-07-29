$htmls = Get-ChildItem -Path "." -Recurse -Filter *.html | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*scratch*" }

Write-Host "Verificando referencias de imágenes en $($htmls.Count) archivos HTML..."

$missingCount = 0
foreach ($h in $htmls) {
    $content = Get-Content -Path $h.FullName -Raw -Encoding UTF8
    if ($content) {
        $regex = 'src=["'']([^"'']+\.(?:webp|png|jpg|jpeg|svg))["'']'
        $matches = [regex]::Matches($content, $regex)
        foreach ($m in $matches) {
            $rel = $m.Groups[1].Value
            if ($rel -notlike "http*") {
                $full = Join-Path (Get-Location).Path $rel.Replace('/', '\')
                if (-not (Test-Path $full)) {
                    Write-Host "REFERENCIA ROTA: $($h.Name) -> $rel"
                    $missingCount++
                }
            }
        }
    }
}

if ($missingCount -eq 0) {
    Write-Host "¡Perfecto! No se encontraron referencias rotas de imágenes."
} else {
    Write-Host "Se encontraron $missingCount referencias rotas de imágenes."
}
