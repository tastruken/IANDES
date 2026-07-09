# Simple PowerShell HTTP Server for Inmobiliaria Iandes
# Run this script to host the static site locally at http://localhost:8000

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

$Host.UI.RawUI.WindowTitle = "Iandes Local Server (Port $port)"

try {
    $listener.Start()
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Inmobiliaria Iandes Local Development Server" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Running at: http://localhost:$port/" -ForegroundColor Green
    Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""

    # Keep listening while the listener is active
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get path and sanitize it
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }
        
        # Replace forward slashes with backward slashes for Windows path
        $cleanPath = $urlPath.Replace('/', '\').TrimStart('\')
        $filePath = Join-Path (Get-Location) $cleanPath
        
        # If it's a directory, check for index.html inside it
        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                ".ico" { "image/x-icon" }
                ".json" { "application/json; charset=utf-8" }
                Default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "$($request.HttpMethod) $($request.Url.PathAndQuery) - 200 OK" -ForegroundColor Green
        }
        else {
            $response.StatusCode = 404
            $errorMessage = "404 - File Not Found: $urlPath"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "$($request.HttpMethod) $($request.Url.PathAndQuery) - 404 Not Found" -ForegroundColor Red
        }
        $response.Close()
    }
}
catch {
    Write-Host "Server error: $_" -ForegroundColor Red
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
    Write-Host "Server stopped." -ForegroundColor Yellow
}
