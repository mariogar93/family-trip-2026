Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\mgl_j\.gemini\antigravity\brain\5e21c61b-f0f7-497e-86a8-e6a106e43796\.user_uploaded\media_1795204043315_b6fa4f3d.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)

# The squircle is centered at X=512, Y=293, size ~384x384
$cropX = 320
$cropY = 101
$cropSize = 384

# 1. Direct Crop
$destBmp = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($destBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
$destRect = New-Object System.Drawing.Rectangle(0, 0, 512, 512)

$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$outPath = "C:\Users\mgl_j\.gemini\antigravity\brain\5e21c61b-f0f7-497e-86a8-e6a106e43796\icon_cropped.png"
$destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$destBmp.Dispose()
$img.Dispose()

Write-Output "Saved: $outPath"
