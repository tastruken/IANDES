$iconsFolder = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\icons"
$svgFiles = Get-ChildItem -Path $iconsFolder -Filter "*.svg"

foreach ($file in $svgFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $modified = $false

    # Replace fill="#000000" or fill="#000" or stroke="#000000" or fill="black" or stroke="black" or #0F172A etc.
    $newContent = $content -replace 'fill="#000000"', 'fill="#D4A017"' `
                           -replace 'fill="#000"', 'fill="#D4A017"' `
                           -replace 'stroke="#000000"', 'stroke="#D4A017"' `
                           -replace 'stroke="#000"', 'stroke="#D4A017"' `
                           -replace 'fill="#0F172A"', 'fill="#D4A017"' `
                           -replace 'stroke="#0F172A"', 'stroke="#D4A017"' `
                           -replace 'fill="#1E293B"', 'fill="#D4A017"' `
                           -replace 'stroke="#1E293B"', 'stroke="#D4A017"' `
                           -replace 'fill="#333333"', 'fill="#D4A017"' `
                           -replace 'stroke="#333333"', 'stroke="#D4A017"' `
                           -replace 'fill="#333"', 'fill="#D4A017"' `
                           -replace 'stroke="#333"', 'stroke="#D4A017"' `
                           -replace 'fill="black"', 'fill="#D4A017"' `
                           -replace 'stroke="black"', 'stroke="#D4A017"'

    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated $($file.Name) to gold #D4A017"
    }
}
