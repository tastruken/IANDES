$pngPath = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\icons\icon-parking.png"
$bytes = [System.IO.File]::ReadAllBytes($pngPath)
$base64 = [System.Convert]::ToBase64String($bytes)

$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <image href="data:image/png;base64,$base64" width="100" height="100"/>
</svg>
"@

$svgPath1 = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\icons\icon-parking.svg"
$svgPath2 = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\icons\icon-estacionamiento.svg"

[System.IO.File]::WriteAllText($svgPath1, $svgContent)
[System.IO.File]::WriteAllText($svgPath2, $svgContent)

Write-Host "Successfully embedded exact user PNG image into icon-parking.svg and icon-estacionamiento.svg!"
