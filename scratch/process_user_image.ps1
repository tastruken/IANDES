Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\piiai\.gemini\antigravity-ide\brain\5db7981a-6836-4dcc-a238-6de675619cdd\media__1785809644116.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

# Find bounding box of non-white / dark car pixels
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if dark pixel (car body)
        if ($pixel.R -lt 100 -and $pixel.G -lt 100 -and $pixel.B -lt 100 -and $pixel.A -gt 10) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Crop bounds: X=$minX..$maxX Y=$minY..$maxY"

$cropW = ($maxX - $minX) + 1
$cropH = ($maxY - $minY) + 1

# Create new target bitmap with padding
$pad = 10
$outW = $cropW + ($pad * 2)
$outH = $cropH + ($pad * 2)

$outBmp = New-Object System.Drawing.Bitmap($outW, $outH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Color replacement: Turn dark pixels into #D4A017 (RGB 212, 160, 23)
for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $srcX = $minX + $x
        $srcY = $minY + $y
        $p = $bmp.GetPixel($srcX, $srcY)

        # Calculate darkness (0 = pure black, 255 = pure white)
        $darkness = (255 - ($p.R + $p.G + $p.B) / 3.0) / 255.0
        if ($p.A -eq 0) { $darkness = 0 }

        if ($darkness -gt 0.1) {
            # Smooth alpha based on darkness for anti-aliasing
            $alpha = [int][Math]::Min(255, [Math]::Max(0, $darkness * ($p.A / 255.0) * 255))
            $color = [System.Drawing.Color]::FromArgb($alpha, 212, 160, 23)
            $outBmp.SetPixel($x + $pad, $y + $pad, $color)
        } else {
            $outBmp.SetPixel($x + $pad, $y + $pad, [System.Drawing.Color]::Transparent)
        }
    }
}

$targetPng1 = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\icons\icon-parking.png"
$targetPng2 = "c:\Users\piiai\OneDrive\Desktop\CONSTRUCTORA\assets\images\icons\icon-estacionamiento.png"

$outBmp.Save($targetPng1, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Save($targetPng2, [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$outBmp.Dispose()

Write-Host "Saved high-res user image to icon-parking.png and icon-estacionamiento.png"
