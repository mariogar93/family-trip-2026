Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\mgl_j\.gemini\antigravity\brain\5e21c61b-f0f7-497e-86a8-e6a106e43796\.user_uploaded\media_1795204043315_b6fa4f3d.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap $img

$minBlueX = $bmp.Width
$maxBlueX = 0
$minBlueY = $bmp.Height
$maxBlueY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Blue squircle has strong blue (B > 180 and B > R + 30)
        if ($c.B -gt 180 -and ($c.B - $c.R) -gt 30) {
            if ($x -lt $minBlueX) { $minBlueX = $x }
            if ($x -gt $maxBlueX) { $maxBlueX = $x }
            if ($y -lt $minBlueY) { $minBlueY = $y }
            if ($y -gt $maxBlueY) { $maxBlueY = $y }
        }
    }
}

Write-Output "Blue Squircle: minX=$minBlueX, maxX=$maxBlueX, minY=$minBlueY, maxY=$maxBlueY, W=$($maxBlueX - $minBlueX), H=$($maxBlueY - $minBlueY)"

$bmp.Dispose()
$img.Dispose()
