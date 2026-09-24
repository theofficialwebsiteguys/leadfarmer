<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * Image upload handling.
 *
 * Security posture:
 *  - The client-supplied MIME type and filename are both ignored. The real type
 *    comes from finfo + getimagesize, and the stored filename is generated.
 *  - Only JPEG / PNG / WebP are accepted (configurable allow-list).
 *  - Size is checked against the configured maximum before anything is written.
 *  - The extension is derived from the *detected* type, so "shell.php.jpg"
 *    cannot survive as anything but a .jpg.
 *  - uploads/.htaccess additionally disables script execution in that directory,
 *    so even a file that somehow smuggled PHP bytes inside valid image data
 *    cannot be executed.
 *
 * Reusable across projects.
 */
final class Uploads
{
    private const EXTENSION_FOR_MIME = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    /**
     * Validates and stores one uploaded file.
     *
     * @param array{name?:string,type?:string,tmp_name?:string,error?:int,size?:int} $file A $_FILES entry
     * @return array{filename:string,url_path:string,mime:string,size_bytes:int,width:int,height:int,original_name:string}
     */
    public static function store(array $file): array
    {
        $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;

        if ($error !== UPLOAD_ERR_OK) {
            Response::error(400, 'upload_failed', self::describeUploadError((int) $error));
        }

        $tmpPath = $file['tmp_name'] ?? '';
        if (!is_string($tmpPath) || $tmpPath === '' || !is_uploaded_file($tmpPath)) {
            Response::error(400, 'upload_failed', 'No file was received.');
        }

        $maxBytes = (int) Config::get('uploads.max_bytes', 8 * 1024 * 1024);
        $size = (int) ($file['size'] ?? 0);

        if ($size <= 0) {
            Response::error(400, 'upload_failed', 'The file is empty.');
        }

        if ($size > $maxBytes) {
            $maxMb = round($maxBytes / 1048576, 1);
            Response::error(413, 'file_too_large', "That image is too large. The maximum size is {$maxMb} MB.");
        }

        // Authoritative type detection — never trust $file['type'].
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $detectedMime = (string) $finfo->file($tmpPath);

        /** @var list<string> $allowed */
        $allowed = (array) Config::get('uploads.allowed_mimes', ['image/jpeg', 'image/png', 'image/webp']);

        if (!in_array($detectedMime, $allowed, true)) {
            Response::error(
                415,
                'unsupported_file_type',
                'Only JPG, PNG and WebP images can be uploaded.'
            );
        }

        // Second, independent check: it must actually parse as an image.
        $imageInfo = @getimagesize($tmpPath);
        if ($imageInfo === false) {
            Response::error(415, 'unsupported_file_type', 'That file is not a readable image.');
        }

        [$width, $height] = $imageInfo;
        $imageMime = $imageInfo['mime'] ?? '';

        if ($imageMime !== $detectedMime) {
            Response::error(415, 'unsupported_file_type', 'That file is not a valid image.');
        }

        $extension = self::EXTENSION_FOR_MIME[$detectedMime];
        $originalName = self::sanitizeOriginalName($file['name'] ?? '');

        // Generated, unguessable filename with a readable prefix from the original.
        $prefix = self::filenamePrefix($originalName);
        $filename = $prefix . '-' . bin2hex(random_bytes(8)) . '.' . $extension;

        $dir = self::uploadDir();
        $destination = $dir . '/' . $filename;

        if (!move_uploaded_file($tmpPath, $destination)) {
            Response::error(500, 'upload_failed', 'The image could not be saved. Check folder permissions.');
        }

        // Never executable, regardless of the directory's umask.
        @chmod($destination, 0644);

        return [
            'filename'      => $filename,
            'url_path'      => rtrim((string) Config::get('uploads.url_path', '/uploads'), '/') . '/' . $filename,
            'mime'          => $detectedMime,
            'size_bytes'    => $size,
            'width'         => (int) $width,
            'height'        => (int) $height,
            'original_name' => $originalName,
        ];
    }

    public static function delete(string $filename): void
    {
        // Defensive: only ever touch a bare filename inside the uploads dir.
        $safe = basename($filename);
        $path = self::uploadDir() . '/' . $safe;

        if (is_file($path)) {
            @unlink($path);
        }
    }

    private static function uploadDir(): string
    {
        $dir = (string) Config::get('uploads.dir', dirname(__DIR__, 2) . '/uploads');

        if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
            Response::error(500, 'upload_failed', 'The uploads folder does not exist and could not be created.');
        }

        if (!is_writable($dir)) {
            Response::error(500, 'upload_failed', 'The uploads folder is not writable. Set it to permission 755.');
        }

        return rtrim($dir, '/');
    }

    private static function sanitizeOriginalName(mixed $name): string
    {
        if (!is_string($name) || $name === '') {
            return 'image';
        }

        // basename() strips any directory traversal attempt in the client name.
        return mb_substr(basename($name), 0, 190);
    }

    private static function filenamePrefix(string $originalName): string
    {
        $stem = pathinfo($originalName, PATHINFO_FILENAME);
        $slug = strtolower((string) preg_replace('/[^A-Za-z0-9]+/', '-', $stem));
        $slug = trim($slug, '-');
        $slug = mb_substr($slug, 0, 60);

        return $slug !== '' ? $slug : 'image';
    }

    private static function describeUploadError(int $code): string
    {
        return match ($code) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'That image is larger than the server allows.',
            UPLOAD_ERR_PARTIAL                        => 'The upload was interrupted. Please try again.',
            UPLOAD_ERR_NO_FILE                        => 'No file was selected.',
            UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE => 'The server could not save the file.',
            UPLOAD_ERR_EXTENSION                      => 'The upload was blocked by the server.',
            default                                   => 'The upload failed. Please try again.',
        };
    }
}
