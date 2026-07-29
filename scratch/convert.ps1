$cwebp = Join-Path (Get-Location).Path "scratch\tools\libwebp-1.3.2-windows-x64\bin\cwebp.exe"
$images = Get-ChildItem -Path "assets\images" -Recurse -Include *.jpg,*.jpeg,*.png | Where-Object { $_.Extension -ne ".svg" -and $_.Extension -ne ".webp" }

Write-Host "Iniciando conversión de $($images.Count) imágenes a formato WebP..."

$count = 0
foreach ($img in $images) {
    $outPath = [System.IO.Path]::ChangeExtension($img.FullName, ".webp")
    & $cwebp -q 82 "$($img.FullName)" -o "$outPath" | Out-Null
    if (Test-Path $outPath) {
        $count++
        # Eliminar original si el webp se generó con éxito
        Remove-Item "$($img.FullName)" -Force
    }
}

Write-Host "Se convirtieron exitosamente $count imágenes a .webp y se eliminaron los originales."
