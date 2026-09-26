<?php
declare(strict_types=1);

namespace LeadFarmer\App;

use LeadFarmer\Lib\Database;

/**
 * Contact form submissions.
 *
 * Stored as well as emailed: mail() on shared hosting fails quietly often
 * enough that email alone would lose enquiries silently.
 */
final class ContactRepo
{
    /** @param array<string,mixed> $data */
    public static function store(array $data, string $ip, bool $emailSent): int
    {
        Database::run(
            'INSERT INTO contact_messages (name, email, phone, subject, message, strain_name, ip_address, email_sent)
             VALUES (:name, :email, :phone, :subject, :message, :strain_name, :ip, :email_sent)',
            [
                'name'        => $data['name'],
                'email'       => $data['email'],
                'phone'       => $data['phone'] !== '' ? $data['phone'] : null,
                'subject'     => $data['subject'] !== '' ? $data['subject'] : null,
                'message'     => $data['message'],
                'strain_name' => $data['strainName'] !== '' ? $data['strainName'] : null,
                'ip'          => mb_substr($ip, 0, 45),
                'email_sent'  => $emailSent ? 1 : 0,
            ]
        );

        return Database::lastInsertId();
    }

    /**
     * Simple per-IP throttle so the form cannot be used to flood an inbox.
     * Deliberately generous — a real person filling in two enquiries should
     * never hit it.
     */
    public static function isRateLimited(string $ip, int $maxPerHour = 5): bool
    {
        $row = Database::one(
            'SELECT COUNT(*) AS recent
               FROM contact_messages
              WHERE ip_address = :ip
                AND created_at >= (NOW() - INTERVAL 1 HOUR)',
            ['ip' => mb_substr($ip, 0, 45)]
        );

        return $row !== null && (int) $row['recent'] >= $maxPerHour;
    }

    /** @return list<array<string,mixed>> */
    public static function all(int $limit = 200): array
    {
        $limit = max(1, min($limit, 500));

        return array_map(
            static fn (array $row): array => self::toJson($row),
            Database::all("SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT {$limit}")
        );
    }

    /** @return array<string,mixed>|null */
    public static function find(int $id): ?array
    {
        $row = Database::one('SELECT * FROM contact_messages WHERE id = :id LIMIT 1', ['id' => $id]);
        return $row === null ? null : self::toJson($row);
    }

    /** Flipped once delivery succeeds; the row is written before that is known. */
    public static function markEmailSent(int $id, bool $sent): void
    {
        Database::run(
            'UPDATE contact_messages SET email_sent = :sent WHERE id = :id',
            ['sent' => $sent ? 1 : 0, 'id' => $id]
        );
    }

    public static function markRead(int $id, bool $isRead): void
    {
        Database::run(
            'UPDATE contact_messages SET is_read = :is_read WHERE id = :id',
            ['is_read' => $isRead ? 1 : 0, 'id' => $id]
        );
    }

    public static function delete(int $id): bool
    {
        return Database::run('DELETE FROM contact_messages WHERE id = :id', ['id' => $id])->rowCount() > 0;
    }

    public static function unreadCount(): int
    {
        $row = Database::one('SELECT COUNT(*) AS unread FROM contact_messages WHERE is_read = 0');
        return (int) ($row['unread'] ?? 0);
    }

    /** @return array<string,mixed> */
    private static function toJson(array $row): array
    {
        return [
            'id'         => (int) $row['id'],
            'name'       => (string) $row['name'],
            'email'      => (string) $row['email'],
            'phone'      => $row['phone'] !== null ? (string) $row['phone'] : '',
            'subject'    => $row['subject'] !== null ? (string) $row['subject'] : '',
            'message'    => (string) $row['message'],
            'strainName' => $row['strain_name'] !== null ? (string) $row['strain_name'] : '',
            'emailSent'  => (bool) $row['email_sent'],
            'isRead'     => (bool) $row['is_read'],
            'createdAt'  => (string) $row['created_at'],
        ];
    }
}
