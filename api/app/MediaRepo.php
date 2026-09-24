<?php
declare(strict_types=1);

namespace LeadFarmer\App;

use LeadFarmer\Lib\Database;

/**
 * The media library: one row per image uploaded through the admin panel.
 */
final class MediaRepo
{
    /**
     * @param array{filename:string,url_path:string,mime:string,size_bytes:int,width:int,height:int,original_name:string} $stored
     */
    public static function record(array $stored, string $altText, ?int $userId): int
    {
        Database::run(
            'INSERT INTO media (filename, url_path, original_name, mime_type, size_bytes, width, height, alt_text, uploaded_by)
             VALUES (:filename, :url_path, :original_name, :mime_type, :size_bytes, :width, :height, :alt_text, :uploaded_by)',
            [
                'filename'      => $stored['filename'],
                'url_path'      => $stored['url_path'],
                'original_name' => $stored['original_name'],
                'mime_type'     => $stored['mime'],
                'size_bytes'    => $stored['size_bytes'],
                'width'         => $stored['width'],
                'height'        => $stored['height'],
                'alt_text'      => $altText,
                'uploaded_by'   => $userId,
            ]
        );

        return Database::lastInsertId();
    }

    /** @return list<array<string,mixed>> */
    public static function all(int $limit = 200): array
    {
        $limit = max(1, min($limit, 500));

        return array_map(
            static fn (array $row): array => self::toJson($row),
            Database::all("SELECT * FROM media ORDER BY created_at DESC, id DESC LIMIT {$limit}")
        );
    }

    /** @return array<string,mixed>|null */
    public static function find(int $id): ?array
    {
        $row = Database::one('SELECT * FROM media WHERE id = :id LIMIT 1', ['id' => $id]);
        return $row === null ? null : self::toJson($row);
    }

    public static function updateAlt(int $id, string $altText): bool
    {
        return Database::run(
            'UPDATE media SET alt_text = :alt WHERE id = :id',
            ['alt' => $altText, 'id' => $id]
        )->rowCount() >= 0;
    }

    /**
     * Deletes the row and the file on disk. Returns the stored filename so the
     * caller can report what was removed.
     */
    public static function delete(int $id): ?string
    {
        $row = Database::one('SELECT filename FROM media WHERE id = :id LIMIT 1', ['id' => $id]);
        if ($row === null) {
            return null;
        }

        Database::run('DELETE FROM media WHERE id = :id', ['id' => $id]);

        return (string) $row['filename'];
    }

    /**
     * Where an image is referenced, so the admin panel can warn before deleting
     * something that is still on the live site.
     *
     * @return list<string> Human-readable descriptions of each usage.
     */
    public static function usages(string $urlPath): array
    {
        $usages = [];

        $contentRows = Database::all(
            'SELECT field_label, section FROM content_blocks WHERE content_value = :path',
            ['path' => $urlPath]
        );
        foreach ($contentRows as $row) {
            $usages[] = ucfirst((string) $row['section']) . ' — ' . (string) $row['field_label'];
        }

        $strainRows = Database::all(
            'SELECT s.name, i.image_kind
               FROM strain_images i
               JOIN strains s ON s.id = i.strain_id
              WHERE i.src = :path',
            ['path' => $urlPath]
        );
        foreach ($strainRows as $row) {
            $usages[] = 'Strain: ' . (string) $row['name'] . ' (' . (string) $row['image_kind'] . ' image)';
        }

        foreach ([['articles', 'title'], ['story_sections', 'heading']] as [$table, $labelColumn]) {
            $rows = Database::all(
                "SELECT {$labelColumn} AS label FROM {$table} WHERE image_src = :path",
                ['path' => $urlPath]
            );
            foreach ($rows as $row) {
                $usages[] = ucfirst(str_replace('_', ' ', $table)) . ': ' . (string) $row['label'];
            }
        }

        return $usages;
    }

    /** @return array<string,mixed> */
    private static function toJson(array $row): array
    {
        return [
            'id'           => (int) $row['id'],
            'filename'     => (string) $row['filename'],
            'path'         => (string) $row['url_path'],
            'url'          => Media::url((string) $row['url_path']),
            'originalName' => $row['original_name'] !== null ? (string) $row['original_name'] : '',
            'mimeType'     => (string) $row['mime_type'],
            'sizeBytes'    => (int) $row['size_bytes'],
            'width'        => (int) $row['width'],
            'height'       => (int) $row['height'],
            'altText'      => $row['alt_text'] !== null ? (string) $row['alt_text'] : '',
            'createdAt'    => (string) $row['created_at'],
        ];
    }
}
