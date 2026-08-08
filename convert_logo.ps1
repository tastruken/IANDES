Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\logos\logo-inarco.png"
$outPath = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\logos\logo-inarco-white.png"

$img = [System.Drawing.Bitmap]::FromFile($imgPath)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height)

for ($x = 0; $x -lt $img.Width; $x++) {
    for ($y = 0; $y -lt $img.Height; $y++) {
        $c = $img.GetPixel($x, $y)
        if ($c.A -gt 15) {
            # Check if pixel is part of the yellow/gold emblem
            if ($c.R -gt 140 -and $c.G -gt 110 -and $c.B -lt 120) {
                # Preserve yellow emblem color exactly
                $bmp.SetPixel($x, $y, $c)
            } else {
                # Convert text (dark/grey pixels) to crisp, pure white with original alpha
                $whiteColor = [System.Drawing.Color]::FromArgb($c.A, 255, 255, 255)
                $bmp.SetPixel($x, $y, $whiteColor)
            }
        } else {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
$bmp.Dispose()
Write-Host "logo-inarco-white.png created successfully!"
