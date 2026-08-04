$iconsFolder = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\icons"
$svgFiles = Get-ChildItem -Path $iconsFolder -Filter "*.svg"

foreach ($file in $svgFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)

    # Replace any stroke:#000000 or stroke:#000 or fill:#000000 or fill:#000 or stroke:#111 or stroke:#222 or stroke:#333 in style tags
    $newContent = [System.Text.RegularExpressions.Regex]::Replace($content, '#000000|#000|#111111|#111|#222222|#222|#333333|#333|#0f172a|#1e293b|#0F172A|#1E293B', '#D4A017')

    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Fixed colors in $($file.Name)"
    }
}
