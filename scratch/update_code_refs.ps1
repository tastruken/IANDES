$files = Get-ChildItem -Path "." -Recurse -Include *.html,*.css,*.js | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*scratch*" }

Write-Host "Reemplazando extensiones de imagen por .webp en $($files.Count) archivos..."

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($content) {
        $updated = $content.Replace('.jpg', '.webp').Replace('.jpeg', '.webp').Replace('.png', '.webp')
        if ($updated -ne $content) {
            [System.IO.File]::WriteAllText($f.FullName, $updated, [System.Text.Encoding]::UTF8)
            Write-Host "Actualizado: $($f.Name)"
        }
    }
}

Write-Host "Reemplazo completado en todo el proyecto."
