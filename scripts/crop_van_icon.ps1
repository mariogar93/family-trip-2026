Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\mgl_j\.gemini\antigravity\brain\5e21c61b-f0f7-497e-86a8-e6a106e43796\.user_uploaded\media_1795204043315_b6fa4f3d.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)

# The van squircle is centered at X=512, Y=293, size ~384x384
$cropX = 320
$cropY = 101
$cropSize = 384
$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)

function Save-Cropped-Van($size, $destRelativePath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $destPath = Join-Path (Get-Location) $destRelativePath
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Successfully saved van icon: $destRelativePath ($size x $size)"
}

Save-Cropped-Van 512 "public\apple-touch-icon.png"
Save-Cropped-Van 180 "public\apple-touch-icon-180x180.png"
Save-Cropped-Van 512 "public\icon-512.png"
Save-Cropped-Van 192 "public\icon-192.png"
Save-Cropped-Van 64  "public\favicon.png"
Save-Cropped-Van 512 "public\icon.png"

$img.Dispose()
