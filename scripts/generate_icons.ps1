Add-Type -AssemblyName System.Drawing

function Generate-AppIcon($size, $outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $scale = $size / 512.0

    # 1. Background Gradient
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($size, $size)),
        [System.Drawing.Color]::FromArgb(255, 20, 25, 39),
        [System.Drawing.Color]::FromArgb(255, 7, 9, 16)
    )
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    $bgBrush.Dispose()

    # 2. Ambient Coral Glow (Center)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $glowRect = New-Object System.Drawing.RectangleF(
        (50 * $scale), (40 * $scale), (412 * $scale), (412 * $scale)
    )
    $path.AddEllipse($glowRect)
    $pbr = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $pbr.CenterColor = [System.Drawing.Color]::FromArgb(85, 255, 59, 104)
    $pbr.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 7, 9, 16))
    $g.FillEllipse($pbr, $glowRect)
    $pbr.Dispose()
    $path.Dispose()

    # 3. Ambient Golden Sunlight Glow (Top Right)
    $path2 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $sunRect = New-Object System.Drawing.RectangleF(
        (220 * $scale), (30 * $scale), (260 * $scale), (260 * $scale)
    )
    $path2.AddEllipse($sunRect)
    $pbr2 = New-Object System.Drawing.Drawing2D.PathGradientBrush($path2)
    $pbr2.CenterColor = [System.Drawing.Color]::FromArgb(70, 245, 158, 11)
    $pbr2.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 7, 9, 16))
    $g.FillEllipse($pbr2, $sunRect)
    $pbr2.Dispose()
    $path2.Dispose()

    # 4. Globe Latitude/Longitude Rings in faint slate
    $globePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 148, 163, 184), (2.0 * $scale))
    $dashPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 148, 163, 184), (2.0 * $scale))
    $dashPen.DashPattern = @(4, 4)

    $cx = 256.0 * $scale
    $cy = 276.0 * $scale
    $r = 145.0 * $scale

    $g.DrawEllipse($dashPen, ($cx - $r), ($cy - $r), ($r * 2), ($r * 2))
    $g.DrawEllipse($globePen, ($cx - $r), ($cy - 56.0 * $scale), ($r * 2), (112.0 * $scale))
    $g.DrawEllipse($globePen, ($cx - 70.0 * $scale), ($cy - $r), (140.0 * $scale), ($r * 2))
    $g.DrawLine($dashPen, ($cx - $r), $cy, ($cx + $r), $cy)
    $g.DrawLine($dashPen, $cx, ($cy - $r), $cx, ($cy + $r))

    $globePen.Dispose()
    $dashPen.Dispose()

    # 5. Flight Trajectory Arc
    $arcPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 255, 59, 104), (5.5 * $scale))
    $arcPen.DashPattern = @(4, 3)
    $g.DrawBezier(
        $arcPen,
        (New-Object System.Drawing.PointF(88 * $scale, 405 * $scale)),
        (New-Object System.Drawing.PointF(140 * $scale, 330 * $scale)),
        (New-Object System.Drawing.PointF(230 * $scale, 240 * $scale)),
        (New-Object System.Drawing.PointF(385 * $scale, 165 * $scale))
    )
    $arcPen.Dispose()

    # Trail dots
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 251, 191, 36))
    $g.FillEllipse($dotBrush, (208 * $scale), (262 * $scale), (8 * $scale), (8 * $scale))
    $g.FillEllipse($dotBrush, (268 * $scale), (220 * $scale), (9 * $scale), (9 * $scale))
    $dotBrush.Dispose()

    # 6. Airplane Silhouette (Heading ~42 degrees climb)
    $g.TranslateTransform((305 * $scale), (195 * $scale))
    $g.RotateTransform(-42)

    # Shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 0, 0, 0))
    $sX = 4 * $scale
    $sY = 12 * $scale
    $g.FillPolygon($shadowBrush, @(
        (New-Object System.Drawing.PointF((0 + $sX), (-105 * $scale + $sY))),
        (New-Object System.Drawing.PointF((14 * $scale + $sX), (60 * $scale + $sY))),
        (New-Object System.Drawing.PointF((0 + $sX), (96 * $scale + $sY))),
        (New-Object System.Drawing.PointF((-14 * $scale + $sX), (60 * $scale + $sY)))
    ))
    $shadowBrush.Dispose()

    # Wings Left (Light) & Right (Darker)
    $wLBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 241, 245, 249))
    $g.FillPolygon($wLBrush, @(
        (New-Object System.Drawing.PointF((-11 * $scale), (-12 * $scale))),
        (New-Object System.Drawing.PointF((-95 * $scale), (40 * $scale))),
        (New-Object System.Drawing.PointF((-12 * $scale), (28 * $scale)))
    ))
    $wLBrush.Dispose()

    $wRBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 180, 195, 210))
    $g.FillPolygon($wRBrush, @(
        (New-Object System.Drawing.PointF((11 * $scale), (-12 * $scale))),
        (New-Object System.Drawing.PointF((95 * $scale), (40 * $scale))),
        (New-Object System.Drawing.PointF((12 * $scale), (28 * $scale)))
    ))
    $wRBrush.Dispose()

    # Fuselage
    $bodyBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(-15 * $scale, 0)),
        (New-Object System.Drawing.PointF(15 * $scale, 0)),
        [System.Drawing.Color]::White,
        [System.Drawing.Color]::FromArgb(255, 226, 232, 240)
    )
    $g.FillPolygon($bodyBrush, @(
        (New-Object System.Drawing.PointF(0, -105 * $scale)),
        (New-Object System.Drawing.PointF(14 * $scale, 60 * $scale)),
        (New-Object System.Drawing.PointF(0, 96 * $scale)),
        (New-Object System.Drawing.PointF(-14 * $scale, 60 * $scale))
    ))
    $bodyBrush.Dispose()

    # Red Nose Cone
    $noseBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 59, 104))
    $g.FillPolygon($noseBrush, @(
        (New-Object System.Drawing.PointF(0, -105 * $scale)),
        (New-Object System.Drawing.PointF(4 * $scale, -93 * $scale)),
        (New-Object System.Drawing.PointF(-4 * $scale, -93 * $scale))
    ))
    $noseBrush.Dispose()

    # Tail Fins
    $tailBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 203, 213, 225))
    $g.FillPolygon($tailBrush, @(
        (New-Object System.Drawing.PointF(-5 * $scale, 74 * $scale)),
        (New-Object System.Drawing.PointF(-36 * $scale, 96 * $scale)),
        (New-Object System.Drawing.PointF(-3 * $scale, 88 * $scale))
    ))
    $g.FillPolygon($tailBrush, @(
        (New-Object System.Drawing.PointF(5 * $scale, 74 * $scale)),
        (New-Object System.Drawing.PointF(36 * $scale, 96 * $scale)),
        (New-Object System.Drawing.PointF(3 * $scale, 88 * $scale))
    ))
    $tailBrush.Dispose()

    # Reset transform
    $g.ResetTransform()

    # 7. Guiding North Star (Top-right)
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
    $sx = 402 * $scale
    $sy = 112 * $scale
    $g.FillPolygon($starBrush, @(
        (New-Object System.Drawing.PointF($sx, $sy - 22 * $scale)),
        (New-Object System.Drawing.PointF($sx + 5 * $scale, $sy - 5 * $scale)),
        (New-Object System.Drawing.PointF($sx + 22 * $scale, $sy)),
        (New-Object System.Drawing.PointF($sx + 5 * $scale, $sy + 5 * $scale)),
        (New-Object System.Drawing.PointF($sx, $sy + 22 * $scale)),
        (New-Object System.Drawing.PointF($sx - 5 * $scale, $sy + 5 * $scale)),
        (New-Object System.Drawing.PointF($sx - 22 * $scale, $sy)),
        (New-Object System.Drawing.PointF($sx - 5 * $scale, $sy - 5 * $scale))
    ))
    $starWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($starWhite, ($sx - 4 * $scale), ($sy - 4 * $scale), (8 * $scale), (8 * $scale))
    $starWhite.Dispose()
    $starBrush.Dispose()

    # 8. Bottom Badge: "EUROPA 2026"
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 255, 255, 255))
    $pillPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(110, 255, 59, 104), (1.5 * $scale))
    $pw = 190.0 * $scale
    $ph = 36.0 * $scale
    $px = 256.0 * $scale - ($pw / 2.0)
    $py = 432.0 * $scale - ($ph / 2.0)
    $g.FillRectangle($pillBrush, $px, $py, $pw, $ph)
    $g.DrawRectangle($pillPen, $px, $py, $pw, $ph)
    $pillBrush.Dispose()
    $pillPen.Dispose()

    # Pin in pill
    $pinBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 59, 104))
    $g.FillEllipse($pinBrush, ($px + 16 * $scale), ($py + 13 * $scale), (10 * $scale), (10 * $scale))
    $pinBrush.Dispose()

    # Text in pill
    $font = New-Object System.Drawing.Font("Arial", (13 * $scale), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textRect = New-Object System.Drawing.RectangleF($px + 10 * $scale, $py, $pw - 10 * $scale, $ph)
    $g.DrawString("EUROPA 2026", $font, $textBrush, $textRect, $sf)
    $font.Dispose()
    $textBrush.Dispose()
    $sf.Dispose()

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated: $outputPath ($size x $size)"
}

Generate-AppIcon 512 "public\apple-touch-icon.png"
Generate-AppIcon 512 "public\icon-512.png"
Generate-AppIcon 192 "public\icon-192.png"
Generate-AppIcon 180 "public\apple-touch-icon-180x180.png"
