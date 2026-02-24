# 파비콘 리사이징 PowerShell 스크립트
# .NET Framework의 System.Drawing 사용

Add-Type -AssemblyName System.Drawing

# 원본 이미지 로드
$originalImage = [System.Drawing.Image]::FromFile("images\ChipGames_favicon.png")

# 리사이징할 크기들
$sizes = @(16, 32, 180, 192, 512)

foreach ($size in $sizes) {
    # 새 비트맵 생성
    $resizedImage = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
    
    # 고품질 리사이징 설정
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # 이미지 그리기
    $graphics.DrawImage($originalImage, 0, 0, $size, $size)
    
    # 파일 저장
    $outputPath = "images\ChipGames_favicon-${size}x${size}.png"
    $resizedImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "생성됨: $outputPath"
    
    # 리소스 해제
    $graphics.Dispose()
    $resizedImage.Dispose()
}

# 원본 이미지 해제
$originalImage.Dispose()

Write-Host "파비콘 리사이징 완료!"
